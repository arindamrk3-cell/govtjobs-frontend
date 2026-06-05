import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  primary: "#0A8C5F",
  primaryDark: "#076647",
  primaryMuted: "#E6F4EF",
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  danger: "#C0392B",
  white: "#FFFFFF",
};

export default function ChatModal({ token, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const [error, setError] = useState("");
  const flatListRef = useRef(null);

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Hi! I'm your Government Jobs & Exams Assistant. I'm here to help you with:\n\n• Government job exam preparation\n• Career guidance\n• Study tips and strategies\n• Current job market insights\n\nHow can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      setError("Please type a message");
      return;
    }

    setError("");
    const userMessage = inputText.trim();
    setInputText("");
    Keyboard.dismiss();

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      const res = await API.post(
        "/chat/send-message",
        {
          conversationId,
          userMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.message.content,
            timestamp: new Date(),
            tokensUsed: res.data.tokensUsed,
          },
        ]);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        "Failed to send message. Please try again.";
      setError(errorMsg);

      // Remove the last user message if API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Chat cleared! How can I help you with government jobs or exams?",
        timestamp: new Date(),
      },
    ]);
    setConversationId(
      `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {item.content}
        </Text>
        {item.tokensUsed && !isUser && (
          <Text style={styles.tokensText}>
            🔧 Tokens: {item.tokensUsed}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={styles.dismissArea}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.chatModal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="school-outline" size={20} color={C.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Study Assistant</Text>
                <Text style={styles.headerSubtitle}>Always here to help</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesList}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          />

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color={C.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={styles.loadingText}>Assistant is thinking...</Text>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Ask about exams, jobs, preparation..."
                placeholderTextColor={C.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!loading}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (loading || !inputText.trim()) && styles.sendBtnDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={loading || !inputText.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={
                    loading || !inputText.trim() ? C.textLight : C.white
                  }
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearChat}
              disabled={loading}
            >
              <Ionicons name="refresh" size={16} color={C.textMid} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 150,
  },

  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },

  modalContainer: {
    maxHeight: "85%",
    zIndex: 151,
  },

  chatModal: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "column",
    maxHeight: "85%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
  },

  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  messagesList: {
    padding: 14,
    gap: 10,
    flexGrow: 1,
    minHeight: 300,
  },

  messageBubble: {
    marginVertical: 4,
    marginHorizontal: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    maxWidth: "85%",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: C.primary,
  },

  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },

  userText: {
    color: C.white,
    fontWeight: "500",
  },

  assistantText: {
    color: C.white,
  },

  tokensText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(192,57,43,0.15)",
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.25)",
  },

  errorText: {
    color: C.danger,
    fontSize: 12,
    flex: 1,
    fontWeight: "500",
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(10,140,95,0.1)",
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.25)",
  },

  loadingText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "500",
  },

  inputContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  input: {
    flex: 1,
    color: C.white,
    fontSize: 13,
    maxHeight: 80,
    paddingVertical: 6,
  },

  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  sendBtnDisabled: {
    backgroundColor: "rgba(10,140,95,0.3)",
  },

  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});
