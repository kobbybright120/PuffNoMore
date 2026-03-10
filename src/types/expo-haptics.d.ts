declare module "expo-haptics" {
  export function selectionAsync(): Promise<void>;
  export function impactAsync(style?: any): Promise<void>;
  export const ImpactFeedbackStyle: {
    Light: string;
    Medium: string;
    Heavy: string;
  };
  export function notificationAsync(type?: any): Promise<void>;
  export const NotificationFeedbackType: {
    Success: string;
    Warning: string;
    Error: string;
  };
}
