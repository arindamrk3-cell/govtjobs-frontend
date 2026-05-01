import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Linking
} from "react-native";
import API from "../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ token, setScreen, setSelectedJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  useEffect(() => {
    fetchJobs();
  }, [stateFilter, qualificationFilter]);

  useEffect(()=>{
    Notifications.requestPermissionsAsync();

  },[]);
  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs", {
        params: {
          state: stateFilter || undefined,
          qualification: qualificationFilter || undefined
        }
      });

      setJobs(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const searchJobs = async (text) => {
    setSearch(text);

    if (text.length === 0) {
      fetchJobs();
      return;
    }

    try {
      const res = await API.get("/jobs/search", {
        params: { keyword: text }
      });

      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };
 const testNotification = async () => {
  console.log("CLICKED 🔥");

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 Govt Job Alert",
        body: "DRDO 2026 Released!"
      },
      trigger: null
    });

    console.log("SCHEDULED ✅");
  } catch (e) {
    console.log("ERROR ❌", e);
  }
};

  console.log("TOKEN in fetching bookmark job:", token);

  const bookmark = async (id) => {
    try {
      await API.post(`/jobs/bookmark/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }

      });
    } catch (err) {
      console.log(err);
    }
  };
  console.log(token);
  const openLink = (url) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setScreen("login");
  }; 
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoDot}>
            <Ionicons name="briefcase" size={20} color="#ffffff" />
          </View>

          <View>
            <Text style={styles.headerTitle}>GovtJobs</Text>
            <Text style={styles.headerSub}>India's official listings</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, styles.activeBookmark]}
            onPress={() => setScreen("bookmark")}
          >
            <Ionicons name="bookmark" size={23} color="#1ba74e" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={23} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>




      <View style={styles.searchWrap}>
        <View style={styles.searchInner}>
          <Ionicons name="search" size={20} color="#070707" />

          <TextInput
            placeholder="Search by title, org, or state…"
            value={search}
            onChangeText={searchJobs}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setStateFilter("West Bengal");
            fetchJobs();
          }}
        >
          <Text>WB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setQualificationFilter("12th");
            fetchJobs();
          }}
        >
          <Text>12th</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setStateFilter("");
            setQualificationFilter("");
            fetchJobs();
          }}
        >
          <Text>Clear</Text>
        </TouchableOpacity>
      </View>


      {/* Job List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {jobs.map((job) => {
          const isUrgent =
            new Date(job.last_date) - new Date() < 7 * 24 * 60 * 60 * 1000;

          const initials = job.organization
            ?.split(" ")
            .map((w) => w[0])
            .slice(0, 3)
            .join("")
            .toUpperCase();

          return (
            <TouchableOpacity key={job._id}
              onPress={() => {
                if (setSelectedJob) {
                  setSelectedJob(job);
                  setScreen("detail");
                } else {
                  console.log("setSelectedJob missing");
                }
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardNew}>
                <View style={styles.jobCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.orgIcon}>
                      <Text style={styles.orgText}>
                        {job.organization.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{job.title}</Text>
                      <Text style={styles.cardOrg}>{job.organization}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookmarkIcon}
                      onPress={() => bookmark(job._id)}
                    >
                      <Ionicons name="bookmark-outline" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>

                  {/* TAGS */}
                  <View style={styles.tagsRow}>
                    <Text style={styles.tag}>{job.qualification}</Text>
                    <Text style={styles.tagState}>{job.state}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* FOOTER */}
                  <View style={styles.footer}>
                    <Text style={styles.dateText}>
                      Closes {new Date(job.last_date).toDateString()}
                    </Text>

                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => openLink(job.link)}
                    >
                      <Text style={styles.applyText}>Apply now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={testNotification} style={{alignSelf:"center", marginVertical:20}}>
          <Text style={{fontSize:16, fontWeight:"bold"}}>Test Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
      
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#8adab8",
    paddingHorizontal: 12
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",

    gap: 300,

    marginBottom: 6
  },

  filterBtn: {
    backgroundColor: "#e8f3f2",
    padding: 10,
    borderRadius: 8
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#73e0af",
    borderBottomWidth: 0.9,
    borderBottomColor: "#000000"
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15
  },

  logoDot: {
    width: 44,
    height: 43,
    borderRadius: 10,
    backgroundColor: "#218f73",
    alignItems: "center",
    justifyContent: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  headerSub: {
    fontSize: 18,
    color: "#576663"
  },

  headerActions: {
    flexDirection: "row",
    gap: 10
  },

  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#baebe1",
    alignItems: "center",
    justifyContent: "center"
  },

  activeBookmark: {
    backgroundColor: "#baebe1"
  },

  searchWrap: {
    padding: 14
  },

  searchInner: {
    flexDirection: "row",
    backgroundColor: "#d1e6df",
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center"
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8
  },

  filterWrap: {
    paddingHorizontal: 14,
    marginBottom: 10
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    marginRight: 8
  },

  chipActive: {
    backgroundColor: "#0F6E56"
  },

  chipText: {
    fontSize: 24,
    color: "#666"
  },

  chipActiveText: {
    color: "#fff",
    fontSize: 20
  },

  jobCard: {
    backgroundColor: "#cee6e0",
    margin: 12,
    padding: 14,
    borderRadius: 16
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  orgIcon: {
    width: 45,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#82c0aa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },

  orgText: {
    color: "#1e6c58",
    fontWeight: "bold"
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "600"
  },

  cardOrg: {
    fontSize: 20,
    color: "#000000"
  },

  bookmarkIcon: {
    
    width: 45,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#8faca2",
    alignItems: "center",
    justifyContent: "center",
  },

  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10
  },

  tag: {
    backgroundColor: "#E1F5EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: .5,
    borderColor: "#2e453f",
    fontSize: 15
  },

  tagState: {
    backgroundColor: "#bedcf8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: .5,
    borderColor: "#5b7eae",
    fontSize: 15
  },

  divider: {
    height: 1,
    backgroundColor: "#92a0a4",
    marginVertical: 10
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  dateText: {
    fontSize: 18,
    fontWeight:600,

    color: "#9b2e2e"
  },

  applyBtn: {
    backgroundColor: "#0F6E56",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10
  },

  applyText: {
    color: "#fff",
    fontSize: 17
  }

});