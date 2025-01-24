import { MemberRelationContextProvider } from "../../data/contexts/member-relation";
import Tree from "../../components/tree";
import Head from "next/head";
import useTreeMetadataAPI from "../../data/hooks/tree-metadata";
import { useRouter } from "next/router";

export default function TreeWrapper() {
  const router = useRouter();
  const treeUuid = router?.query?.uuid;

  const { data: treeData } = useTreeMetadataAPI(treeUuid);

  return (
    <MemberRelationContextProvider>
      <Head>
        <title>
          {treeUuid ? `Cognatus | ${treeData[0]?.name}` : "Cognatus"}
        </title>
      </Head>
      <Tree />
    </MemberRelationContextProvider>
  );
}
