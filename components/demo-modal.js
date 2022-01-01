import { Button, Modal, Steps} from "antd";
import Image from 'next/image'; 
import { useStyletron } from "styletron-react";

export function DemoModal({visible, onCancel}) {
  const [css] = useStyletron(); 

  const steps = [
    { 
      label: 'Click on an individual after exploring the tree (scroll to zoom).',
      imagePath: '/step-one.png', 
      height: 300,
      width: Math.round(300 * 1.02), 
    },
    { 
      label: 'Click on the "Relations" tab on the profile card to query how others are related to the selected individual.',
      imagePath: '/step-two.png', 
      height: 300,
      width: Math.round(300 * 1.09), 
    },
  ]; 

  return (
    <Modal 
      title='Welcome to Cognatus!' 
      visible={visible} 
      onCancel={onCancel}
      footer={[
        <Button key="submit" type="primary" onClick={onCancel}>
          OK
        </Button>,
      ]}
    > 
      <div className={css({
        maxHeight: '500px', 
        overflow: 'auto', 
      })}>
        <Steps direction="vertical" size="small">
          { 
            steps.map(({label, imagePath, width, height}, i) => (
              <Steps.Step 
                key={i}
                title={label} 
                description={
                  <Image 
                    src={imagePath}
                    alt='demo-step'
                    width={width}
                    height={height}
                  />       
                }
              />
            ))
          }
        </Steps>
      </div>
    </Modal>
  )
}