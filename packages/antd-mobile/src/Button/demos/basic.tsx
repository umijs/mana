import { WhiteSpace, WingBlank } from 'antd-mobile';
import { Button } from 'antd-mobile-a';

const ButtonExample = () => (
  <WingBlank>
    <Button>default</Button>
    <WhiteSpace />
    <Button disabled>default disabled</Button>
    <WhiteSpace />

    <Button type="primary">primary</Button>
    <WhiteSpace />
    <Button type="primary" disabled>
      primary disabled
    </Button>
    <WhiteSpace />

    <Button type="warning">warning</Button>
    <WhiteSpace />
    <Button type="warning" disabled>
      warning disabled
    </Button>
  </WingBlank>
);

export default ButtonExample;
