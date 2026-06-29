import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet, Text } from "react-native";

/**
 * ImposterFace
 * A pure React Native animated imposter mask face.
 * Cycles: Neutral → Smile → Neutral → Sad → Neutral → …
 */
export default function ImposterFace({ size = 130, colors }) {
  const mouthProgress = useRef(new Animated.Value(0)).current;
  const bodyBob = useRef(new Animated.Value(0)).current;
  const eyeScaleL = useRef(new Animated.Value(1)).current;
  const eyeScaleR = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  const [mouthVal, setMouthVal] = useState(0);

  useEffect(() => {
    const expressionLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mouthProgress, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.delay(1600),
        Animated.timing(mouthProgress, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.delay(500),
        Animated.timing(mouthProgress, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.delay(1600),
        Animated.timing(mouthProgress, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.delay(500),
      ])
    );

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyBob, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bodyBob, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    expressionLoop.start();
    bobLoop.start();
    glowLoop.start();

    const id = mouthProgress.addListener(({ value }) => setMouthVal(value));

    let blinkTimer;
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(eyeScaleL, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeScaleL, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(eyeScaleR, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeScaleR, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      blinkTimer = setTimeout(doBlink, 2000 + Math.random() * 3500);
    };
    blinkTimer = setTimeout(doBlink, 2000);

    return () => {
      expressionLoop.stop();
      bobLoop.stop();
      glowLoop.stop();
      mouthProgress.removeListener(id);
      clearTimeout(blinkTimer);
    };
  }, []);

  const floatY = bodyBob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0.3, 1], outputRange: [0.2, 0.55] });

  const s = size;
  const headW = s;
  const headH = s * 1.12;
  const eyeW = s * 0.155;
  const eyeH = s * 0.19;
  const eyeY = headH * 0.34;
  const eyeXOffset = s * 0.2;
  const noseTipY = headH * 0.56;
  const mouthCenterY = headH * 0.72;
  const mouthHalfW = s * 0.22;
  const mouthH = s * 0.05;

  const absArc = Math.abs(mouthVal);
  const isDark = colors?.isDark;
  const smileColor = mouthVal > 0.3 ? "#FF6B6B" : mouthVal < -0.3 ? "#6BB8FF" : isDark ? "#555" : "#ccc";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: floatY }] }]}>
      {/* Glow ring */}
      <Animated.View
        style={{
          position: "absolute",
          alignSelf: "center",
          width: s * 1.6,
          height: s * 1.6,
          borderRadius: s * 0.8,
          opacity: glowOpacity,
          backgroundColor: isDark ? "rgba(167,139,250,0.2)" : "rgba(99,102,241,0.1)",
          top: "50%",
          left: "50%",
          marginLeft: -(s * 0.8),
          marginTop: -(s * 0.8),
        }}
      />

      {/* Body jacket */}
      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          width: s * 0.82,
          height: s * 0.5,
          borderRadius: s * 0.41,
          bottom: -s * 0.14,
          backgroundColor: "#F5C842",
          borderWidth: 2,
          borderColor: "#D4A800",
        }}
      />

      {/* Shirt collar */}
      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          width: s * 0.32,
          height: s * 0.2,
          bottom: s * 0.04,
          borderRadius: 4,
          backgroundColor: "#F9A8D4",
          borderWidth: 1.5,
          borderColor: "#E879A0",
        }}
      />

      {/* HEAD */}
      <View
        style={[
          styles.head,
          {
            width: headW,
            height: headH,
            borderRadius: headW * 0.52,
            backgroundColor: "#F4F4F4",
            borderColor: "#D8D8D8",
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.5 : 0.2,
            shadowRadius: 18,
            elevation: 10,
          },
        ]}
      >
        {/* Face shading */}
        <View style={{
          position: "absolute", left: 0, top: 0,
          width: "45%", height: "100%",
          borderRadius: headW * 0.5,
          backgroundColor: "rgba(0,0,0,0.025)",
        }} />

        {/* Left eye */}
        <Animated.View style={[styles.eye, {
          width: eyeW, height: eyeH,
          borderRadius: eyeW / 2,
          left: headW / 2 - eyeXOffset - eyeW / 2,
          top: eyeY - eyeH / 2,
          backgroundColor: "#111",
          transform: [{ scaleY: eyeScaleL }],
        }]}>
          <View style={[styles.eyeShine, { width: eyeW * 0.28, height: eyeW * 0.28, top: eyeH * 0.15, left: eyeW * 0.55 }]} />
        </Animated.View>

        {/* Right eye */}
        <Animated.View style={[styles.eye, {
          width: eyeW, height: eyeH,
          borderRadius: eyeW / 2,
          left: headW / 2 + eyeXOffset - eyeW / 2,
          top: eyeY - eyeH / 2,
          backgroundColor: "#111",
          transform: [{ scaleY: eyeScaleR }],
        }]}>
          <View style={[styles.eyeShine, { width: eyeW * 0.28, height: eyeW * 0.28, top: eyeH * 0.15, left: eyeW * 0.55 }]} />
        </Animated.View>

        {/* Nose bump */}
        <View style={{
          position: "absolute",
          width: s * 0.09, height: s * 0.06,
          borderRadius: s * 0.045,
          backgroundColor: "rgba(0,0,0,0.07)",
          left: headW / 2 - (s * 0.09) / 2,
          top: noseTipY,
        }} />

        {/* Mouth */}
        <View style={{
          position: "absolute",
          left: headW / 2 - mouthHalfW,
          top: mouthCenterY - mouthH,
          width: mouthHalfW * 2,
          height: mouthH * 2.5,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <View style={{
            width: mouthHalfW * 1.8,
            height: mouthH * 2.8,
            backgroundColor: absArc > 0.05 ? smileColor : (isDark ? "#666" : "#ccc"),
            borderTopLeftRadius: mouthArcStrength >= 0 ? mouthHalfW * absArc * 2 : mouthHalfW * 0.1,
            borderTopRightRadius: mouthArcStrength >= 0 ? mouthHalfW * absArc * 2 : mouthHalfW * 0.1,
            borderBottomLeftRadius: mouthArcStrength < 0 ? mouthHalfW * absArc * 2 : mouthHalfW * 0.1,
            borderBottomRightRadius: mouthArcStrength < 0 ? mouthHalfW * absArc * 2 : mouthHalfW * 0.1,
          }} />
        </View>

        {/* Cheek blush when smiling */}
        {mouthVal > 0.3 && (
          <>
            <View style={{
              position: "absolute",
              left: headW * 0.07, top: eyeY + eyeH + s * 0.04,
              width: s * 0.13, height: s * 0.065, borderRadius: s * 0.032,
              backgroundColor: `rgba(255,100,120,${mouthVal * 0.3})`,
            }} />
            <View style={{
              position: "absolute",
              right: headW * 0.07, top: eyeY + eyeH + s * 0.04,
              width: s * 0.13, height: s * 0.065, borderRadius: s * 0.032,
              backgroundColor: `rgba(255,100,120,${mouthVal * 0.3})`,
            }} />
          </>
        )}
      </View>

      {/* Floating symbols */}
      <FloatingSymbol size={s} sign="?" delay={0} x={-s * 0.75} y={-s * 0.22} color={isDark ? "#a78bfa" : "#6366f1"} />
      <FloatingSymbol size={s} sign="!" delay={700} x={s * 0.65} y={-s * 0.38} color={isDark ? "#fb923c" : "#f97316"} />
      <FloatingSymbol size={s} sign="?" delay={1300} x={s * 0.52} y={s * 0.18} color={isDark ? "#34d399" : "#10b981"} />
    </Animated.View>
  );
}

function FloatingSymbol({ size, sign, delay, x, y, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const opacity = fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.65] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: x,
        marginTop: y,
        fontSize: size * 0.15,
        fontWeight: "900",
        color,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {sign}
    </Animated.Text>
  );
}

// hack: expose mouthArcStrength to avoid linter "no-use-before-define" issue
const mouthArcStrength = 0;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  head: {
    position: "relative",
    borderWidth: 1.5,
    alignSelf: "center",
  },
  eye: {
    position: "absolute",
    overflow: "hidden",
  },
  eyeShine: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
