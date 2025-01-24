import { Button, Modal } from "antd";
import Image from "next/image";

export function DemoModal({ visible, onCancel }) {
  const steps = [
    {
      label:
        "Explore the tree by clicking-and-dragging and scrolling to zoom. Click on an individual to view their profile. Connections between individuals represent either parent/child (blue) or spousal (purple) relations.",
      imagePath: "/step-one.png",
      height: 300,
      width: Math.round(300 * 1.02),
    },
    {
      label:
        'Click on the "Relations" tab on the profile card to query how others are related to the selected individual.',
      imagePath: "/step-two.png",
      height: 300,
      width: Math.round(300 * 1.09),
    },
    {
      label:
        'Click on the "Stats" tab on the profile card to view a histogram of family members\' ages, the ratio of males to females in a tree, etc.',
      imagePath: null,
    },
  ];

  return (
    <Modal
      title="How to use Cognatus"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="submit" type="primary" onClick={onCancel}>
          OK
        </Button>,
      ]}
    >
      <div className="max-h-[500px] overflow-auto">
        {steps.map(({ label, imagePath, width, height }, i) => (
          <div key={i} className="flex flex-col w-full mb-6">
            <div className="mb-6">
              {i + 1}) {label}
            </div>
            {imagePath && (
              <div className="flex justify-center">
                <Image
                  src={imagePath}
                  alt="demo-step"
                  layout="fixed"
                  width={width}
                  height={height}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
