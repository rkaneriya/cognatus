import "chart.js/auto";
import moment from "moment";
import { useContext } from "react";
import { Typography } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import { MemberRelationContext } from "../data/contexts/member-relation";

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
};

function ChartWrapper({ children }) {
  return <div className="w-full mb-8">{children}</div>;
}

export default function StatsTab() {
  const { members } = useContext(MemberRelationContext);

  const numMales = members.reduce((acc, m) => {
    return acc + (m.is_male ? 1 : 0);
  }, 0);

  const numMembersByDecade = members.reduce((acc, m) => {
    const birthDate = moment(m.birth_date);
    const fromDate = m.death_date ? moment(m.death_date) : moment();
    const age = fromDate.diff(birthDate, "years");
    const decade = Math.floor(age / 10) * 10;
    if (acc[decade]) {
      acc[decade] = acc[decade] + 1;
    } else {
      acc[decade] = 1;
    }
    return acc;
  }, {});

  const sexData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "# of Relatives",
        data: [numMales, members.length - numMales],
        backgroundColor: ["rgba(23,131,255)", "rgba(212,127,254)"],
        borderWidth: 1,
      },
    ],
  };

  const decadeData = {
    labels: Object.keys(numMembersByDecade).map(
      (decade) => `${decade}-${Number(decade) + 10}`
    ),
    datasets: [
      {
        data: Object.keys(numMembersByDecade).map(
          (decade) => numMembersByDecade[decade]
        ),
        backgroundColor: [
          "rgba(23,131,255)",
          "rgba(0,201,201)",
          "rgba(235,134,76)",
          "rgba(212,127,254)",
          "rgba(119,99,254)",
          "rgba(96,196,45)",
        ],
      },
    ],
  };

  return (
    <div className="h-[500px] overflow-auto">
      <Typography.Title level={4}>Age Breakdown by Decade</Typography.Title>
      <ChartWrapper>
        <Bar options={options} data={decadeData} />
      </ChartWrapper>
      <Typography.Title level={4}>Sex Breakdown</Typography.Title>
      <ChartWrapper>
        <Pie data={sexData} />
      </ChartWrapper>
    </div>
  );
}
