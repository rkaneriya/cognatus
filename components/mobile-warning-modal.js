import { Button, Modal } from "antd";
import { useStyletron } from "styletron-react";

export default function MobileWarningModal({visible, onCancel}) {
  const [css] = useStyletron(); 
  return (
    <Modal 
      title='Uh oh' 
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
        <p>
          {`Hi, there. I see that you're using a mobile device.`}
        </p>
        <p>
          {`Unfortunately, Cognatus isn't optimized for a mobile experience (yet).`}
        </p>
        <p>
          {`I recommend using a desktop browser in order to get the best experience. Google Chrome is best, but any browser should work.`}
        </p>
      </div>
    </Modal>
  )
}