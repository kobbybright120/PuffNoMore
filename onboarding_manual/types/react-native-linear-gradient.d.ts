declare module "react-native-linear-gradient" {
  import { ComponentType } from "react";
  import { ViewProps } from "react-native";

  type LinearGradientProps = ViewProps & {
    colors: string[];
    locations?: number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };

  const LinearGradient: ComponentType<LinearGradientProps>;
  export default LinearGradient;
}
