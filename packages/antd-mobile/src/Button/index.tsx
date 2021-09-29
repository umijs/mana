import * as React from 'react';
import AButton from 'antd-mobile/lib/button';
import { ButtonProps } from 'antd-mobile/es/button';
import './index.less';

export const Button: React.FC<ButtonProps> = (props) => {
  const { onClick, ...other } = props;

  return (
    <AButton
      {...other}
      onClick={(e) => {
        alert("hello,I'm antd-mobile-a");
        onClick && onClick(e);
      }}
    ></AButton>
  );
};

Button.displayName = 'Button';

export default Button;
