import { Avatar, Tooltip } from "antd";
import { ROUTES } from "../constants/routes";
import Link from "next/link";

export default function Demos() {
  const demos = [
    {
      file: "/fdr.jpeg",
      path: ROUTES.DEMO_ROOSEVELTS,
      label: "The Roosevelts",
    },
    {
      file: "/queen.jpg",
      path: ROUTES.DEMO_BRITISH_ROYALS,
      label: "The British Royal Family",
    },
  ];

  const IMAGE_WIDTH = 100;

  return (
    <div className="mt-5 flex flex-row gap-5">
      {demos.map(({ file, path, label }) => (
        <div key={file} className="flex flex-col justify-center items-center">
          <Tooltip placement="bottom" title={label}>
            <div className="w-fit h-fit border-4 border-gray-300 rounded-full opacity-70 hover:opacity-100 hover:border-gray-400 hover:cursor-pointer">
              <Link href={path} passHref>
                <Avatar src={file} size={IMAGE_WIDTH} />
              </Link>
            </div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
