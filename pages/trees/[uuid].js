import { MemberRelationContextProvider } from "../../data/contexts/member-relation";
import Tree from "../../components/tree";
import Head from "next/head";
import useTreeMetadataAPI from "../../data/hooks/tree-metadata";
import { useRouter } from "next/router";

export default function TreeWrapper() {
  const router = useRouter();
  const treeUuid = router?.query?.uuid;
  const { data: treeData } = useTreeMetadataAPI(treeUuid);

  let title = "Cognatus";
  if (treeData[0]?.name) {
    title += ` | ${treeData[0]?.name}`;
  }

  return (
    <MemberRelationContextProvider>
      <Head>
        <title>{title}</title>
      </Head>
      <Tree />
    </MemberRelationContextProvider>
  );
}
