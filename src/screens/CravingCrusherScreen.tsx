import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CravingCrusher from "../components/CravingCrusher";

const CravingCrusherScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1 }}>
      <CravingCrusher
        visible={true}
        onClose={() => navigation.goBack()}
        roundSeconds={0}
      />
    </View>
  );
};

export default CravingCrusherScreen;
