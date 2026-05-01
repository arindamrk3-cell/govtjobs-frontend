import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function JobDetailScreen({ job, setScreen }) {

  if (!job) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
  const openLink = () => {
    Linking.openURL(job.link);
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Job Details</Text>

        <View style={{ width: 22 }} />
      </View>

      {/* JOB CARD */}
      <View style={styles.card}>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.org}>{job.organization}</Text>

        {/* TAGS */}
        <View style={styles.tags}>
          <Text style={styles.tag}>{job.qualification}</Text>
          <Text style={styles.tagState}>{job.state}</Text>
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>Last Date</Text>
          <Text style={styles.value}>
            {new Date(job.last_date).toDateString()}
          </Text>
        </View>

        {/* APPLY BUTTON */}
        <TouchableOpacity style={styles.applyBtn} onPress={openLink}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>

      </View>

      {/* EXTRA INFO (optional later) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Job</Text>
        <Text style={styles.desc}>
          This is a government job opportunity. Check official notification
          for full details like eligibility, selection process, and syllabus.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8adab8"
  },

  header: {
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#0a7739",
    
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff"
  },

  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 16,
    borderRadius: 16
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4
  },

  org: {
    fontSize: 15,
    fontWeight: "500",
    color: "#777",
    marginBottom: 10
  },

  tags: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },

  tag: {
    backgroundColor: "#b0dccd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#5d89b8",
    fontSize: 15
  },

  tagState: {
    backgroundColor: "#b8cde0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#5d89b8",
    fontSize: 15
  },

  infoBox: {
    marginBottom: 16
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000"
  },

  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff0000",
  },

  applyBtn: {
    backgroundColor: "#0F6E56",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  applyText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600"
  },

  section: {
    marginHorizontal: 16,
    marginTop: 10
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6
  },

  desc: {
    fontSize: 18,
    color: "#343131",
    lineHeight: 18
  }
});