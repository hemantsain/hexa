import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, Linking, Alert } from "react-native";
import { useDispatch } from "react-redux";
import Video from "react-native-video";
import Colors from "../common/Colors";

import { initializeDB } from "../store/actions/storage";
import AsyncStorage from "@react-native-community/async-storage";

export default function Launch(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeDB());
  }, []);

  Linking.getInitialURL()
    .then(url => {
      setTimeout(async () => {
        if (await AsyncStorage.getItem("hasCreds"))
          if (!url) props.navigation.replace("Login");
          else {
            const splits = url.split("/");
            const requester = splits[3];
            if (splits[4] === "sss") {
              if (splits[5] === "ek") {
                const custodyRequest = { requester, ek: splits[6] };
                props.navigation.replace("Login", { custodyRequest });
              } else if (splits[5] === "rk") {
                const recoveryRequest = { requester, rk: splits[6] };
                props.navigation.replace("Login", { recoveryRequest });
              }
            }
          }
        else props.navigation.replace("PasscodeConfirm");
      }, 0);
    })
    .catch(err => Alert.alert("An err occured", err));

  return (
    <View style={styles.container}>
      <Video
        source={require("./../assets/video/splash_animation.mp4")}
        style={{
          flex: 1
        }}
        muted={true}
        repeat={false}
        resizeMode={"cover"}
        rate={1.0}
        ignoreSilentSwitch={"obey"}
      />
      <StatusBar
        backgroundColor={"white"}
        hidden={true}
        barStyle="dark-content"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  }
});