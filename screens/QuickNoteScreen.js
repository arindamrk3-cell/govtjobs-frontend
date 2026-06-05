import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const C = {
    bg: "#0D1F1A",
    surface: "#FFFFFF",
    text: "#0D1F1A",
    textMid: "#4A6360",
    border: "#DDE8E4",
    white: "#FFFFFF",
    primary: "#0A8C5F",
};

export default function QuickNoteScreen({ selectedQuickNote, setScreen }) {
    const insets = useSafeAreaInsets();
    if (!selectedQuickNote) {
        return null;
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => setScreen("notes-list")} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.headerTitle}>
                        {selectedQuickNote.title}
                    </Text>
                    <Text style={styles.headerSub}>
                        {selectedQuickNote.category}
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {
                    selectedQuickNote.content.map(
                        (block, index) => {
                            if (block.type === "heading") {
                                return (
                                    <Text key={index}
                                        style={styles.heading}>
                                        {block.text}
                                    </Text>
                                );
                            }
                            if (block.type === "bullet") {
                                return (
                                    <View key={index}
                                        style={styles.bulletRow}>
                                        <View style={styles.bulletDot} />
                                        <Text
                                            style={styles.bulletText}>
                                            {block.text}
                                        </Text>
                                    </View>

                                );
                            }
                            if (block.type === "important") {

                                return (

                                    <View
                                        key={index}
                                        style={styles.importantBox}
                                    >

                                        <Ionicons
                                            name="alert-circle"
                                            size={18}
                                            color="#D97706"
                                        />

                                        <Text style={styles.importantText}>
                                            {block.text}
                                        </Text>

                                    </View>

                                );
                            }

                            if (block.type === "formula") {

                                return (

                                    <View
                                        key={index}
                                        style={styles.formulaBox}
                                    >

                                        <Text style={styles.formulaText}>
                                            {block.text}
                                        </Text>

                                    </View>

                                );
                            }

                            return (
                                <Text key={index}
                                    style={styles.paragraph}>
                                    {block.text}
                                </Text>

                            );
                        }
                    )
                }
                <View style={{ height: 40 }} />
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",

    },
    headerTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    },
    headerSub: {
        marginTop: 3,
        color: "rgba(255,255,255,0.45)",
        fontSize: 11,
        //fontWeight:700
    },
    content: {
        padding: 16,

    },
    heading: {
        fontSize: 22,
        fontWeight: "800",
        color: "#ffff",
        marginBottom: 18,
        marginTop: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 28,
        color: "rgba(255,255,255,0.88)",
        marginBottom: 18,
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
        gap: 10,
    },
    bulletDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: C.primary,
        marginTop: 9,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 26,
        color: "rgba(255,255,255,0.88)"
    },
    importantBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: "#FEF3C7",
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
    },

    importantText: {
        flex: 1,
        color: "#92400E",
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 24,
    },

    formulaBox: {
        backgroundColor: "#EAF2FF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
    },

    formulaText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1D4ED8",
        lineHeight: 24,
    },

});