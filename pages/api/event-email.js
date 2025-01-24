import moment from "moment";
import sendgrid from "../../utils/sendgrid";
import { getServiceSupabase } from "../../utils/supabase";
import { TREE_TABLE, TREE_TABLE_ROWS } from "../../data/entities/tree";
import {
  RELATION_TABLE,
  RELATION_TABLE_ROWS,
} from "../../data/entities/relation";
import { MEMBER_TABLE, MEMBER_TABLE_ROWS } from "../../data/entities/member";
import { RELATION_TYPES } from "../../constants/relation-types";
import {
  SHAREE_TREE_EXT_TABLE,
  SHAREE_TREE_EXT_TABLE_ROWS,
} from "../../data/entities/sharee-tree-ext";

const MONTH_FORMAT = "MMMM";
const MONTH_DAY_FORMAT = "MMM D";
const YEAR_FORMAT = "YYYY";

export default async function handler(req, res) {
  const supabase = getServiceSupabase();

  // Authz
  const EVENT_EMAIL_KEY = req?.headers?.authorization || "";
  if (!EVENT_EMAIL_KEY) {
    return res.status(400).json({ success: "false" });
  }

  if (
    !process.env.EVENT_EMAIL_KEY ||
    !EVENT_EMAIL_KEY ||
    process.env.EVENT_EMAIL_KEY !== EVENT_EMAIL_KEY
  ) {
    return res.status(500).json({ success: "false" });
  }

  // get all users
  const { data: users, error: userError } = await supabase.auth.api.listUsers();
  if (userError) {
    return;
  }

  // for each user...
  for (let i = 0; i < users.length; i++) {
    // fetch all trees shared with user with e-mail subscription
    const { data: sharedExtData, error: sharedTreesError } = await supabase
      .from(SHAREE_TREE_EXT_TABLE)
      .select("*")
      .eq(SHAREE_TREE_EXT_TABLE_ROWS.SHAREE_EMAIL, users[i]?.email)
      .eq(TREE_TABLE_ROWS.IS_EMAIL_SUBSCRIBED, "true");

    if (sharedTreesError) {
      return;
    }

    // fetch all of user's trees with e-mail subscription
    const orCondition = `${TREE_TABLE_ROWS.UUID}.in.(${sharedExtData.map((s) => s.tree_uuid)}),and(${TREE_TABLE_ROWS.CREATOR_UUID}.eq.${users[i]?.id},${TREE_TABLE_ROWS.IS_EMAIL_SUBSCRIBED}.eq.true)`;
    const { data: trees, error: treeError } = await supabase
      .from(TREE_TABLE)
      .select("*")
      .or(orCondition);

    if (treeError) {
      return;
    }

    // for each tree...
    for (let j = 0; j < trees.length; j++) {
      // fetch all members...
      const { data: members, error: membersError } = await supabase
        .from(MEMBER_TABLE)
        .select("*")
        .eq(MEMBER_TABLE_ROWS.TREE_UUID, trees[j][TREE_TABLE_ROWS.UUID]);

      if (membersError) {
        return;
      }

      // ...and relations
      const { data: relations, error: relationsError } = await supabase
        .from(RELATION_TABLE)
        .select("*")
        .eq(RELATION_TABLE_ROWS.TREE_UUID, trees[j][TREE_TABLE_ROWS.UUID]);

      if (relationsError) {
        return;
      }

      // extract birthdays and anniversaries for upcoming month (organized by event and ordered by day)
      const birthdays = [];
      const weddingAnniversaries = [];
      const deathAnniversaries = [];

      // (birthdays and death anniversaries from members)
      for (let m = 0; m < members.length; m++) {
        const { first_name, last_name, birth_date, death_date, use_year_only } =
          members[m];

        if (use_year_only) {
          continue;
        }

        const displayName = `${first_name} ${last_name}`;

        const mBirthDate = moment(birth_date);
        const mDeathDate = moment(death_date);
        const age = moment().add(1, "months").diff(mBirthDate, "years");
        const deadYears = moment().diff(mDeathDate, "years");

        if (death_date) {
          if (moment().month() === mDeathDate.month()) {
            deathAnniversaries.push({
              date: mDeathDate.format(MONTH_DAY_FORMAT),
              value: `${displayName} (d. ${mDeathDate.format(YEAR_FORMAT)}, ${deadYears} years ago)`,
            });
          }
          continue;
        }

        if (moment().month() === mBirthDate.month()) {
          birthdays.push({
            date: mBirthDate.format(MONTH_DAY_FORMAT),
            value: `${displayName} (b. ${mBirthDate.format(YEAR_FORMAT)}, turning ${age})`,
          });
          continue;
        }
      }

      const membersByUuid = members.reduce(
        (acc, member) => ({
          ...acc,
          [member.uuid]: member,
        }),
        {},
      );

      // (wedding anniversaries from relations)
      for (let r = 0; r < relations.length; r++) {
        const { from_member_uuid, to_member_uuid, type, start_date, end_date } =
          relations[r];

        if (type !== RELATION_TYPES.SPOUSE || end_date) {
          continue;
        }

        const mMarriageStartDate = moment(start_date);

        if (moment().month() !== mMarriageStartDate.month()) {
          continue;
        }

        const marriageLength = moment()
          .add(1, "months")
          .diff(mMarriageStartDate, "years");
        const fromSpouse = membersByUuid[from_member_uuid];
        const toSpouse = membersByUuid[to_member_uuid];

        if (fromSpouse.use_year_only || toSpouse.use_year_only) {
          continue;
        }
        const displayFromSpouse = `${fromSpouse.first_name} ${fromSpouse.last_name}`;
        const displayToSpouse = `${toSpouse.first_name} ${toSpouse.last_name}`;

        weddingAnniversaries.push({
          date: mMarriageStartDate.format(MONTH_DAY_FORMAT),
          value: `${displayFromSpouse} & ${displayToSpouse} (m. ${mMarriageStartDate.format(YEAR_FORMAT)}, celebrating ${marriageLength} years)`,
        });
      }

      // skip e-mail if no events in month
      if (
        birthdays.length === 0 &&
        weddingAnniversaries.length === 0 &&
        deathAnniversaries.length === 0
      ) {
        continue;
      }

      birthdays.sort((a, b) => moment(a.date).diff(moment(b.date)));
      weddingAnniversaries.sort((a, b) => moment(a.date).diff(moment(b.date)));
      deathAnniversaries.sort((a, b) => moment(a.date).diff(moment(b.date)));

      // send e-mail to user
      const data = {
        to: users[i].email,
        template_id: "d-9f7a0b356dde43c7808064c90c58d30a",
        from: "info@cognatus.app",
        dynamic_template_data: {
          subject: `[Cognatus] ${moment().format(MONTH_FORMAT)} - ${trees[j][TREE_TABLE_ROWS.NAME]}`,
          tree_name: trees[j][TREE_TABLE_ROWS.NAME],
          birthdays,
          wedding_anniversaries: weddingAnniversaries,
          death_anniversaries: deathAnniversaries,
          tree_url: `https://www.cognatus.app/trees/${trees[j][TREE_TABLE_ROWS.UUID]}`,
        },
      };

      sendgrid.send(data);
    }
  }
  return res.status(200).json({ success: "true" });
}
