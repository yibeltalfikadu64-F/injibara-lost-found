// mobile/src/features/claims/components/VerificationQuestions.tsx

import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import type { VerificationAnswer } from "../services/claimsApi";

interface VerificationQuestionsProps {
  value: VerificationAnswer[];
  onChange: (answers: VerificationAnswer[]) => void;
  questions?: string[];
  disabled?: boolean;
  error?: string;
}

const DEFAULT_QUESTIONS = [
  "What makes this item uniquely yours?",
  "Can you describe a feature that is not visible in the photos?",
  "What was inside or attached to this item?",
];

const VerificationQuestions: React.FC<VerificationQuestionsProps> = ({
  value,
  onChange,
  questions = DEFAULT_QUESTIONS,
  disabled = false,
  error,
}) => {
  const answers = useMemo(
    () =>
      questions.map((question) => {
        const existing = value.find((answer) => answer.question === question);

        return {
          question,
          answer: existing?.answer || "",
        };
      }),
    [questions, value],
  );

  const updateAnswer = (question: string, answer: string) => {
    const updated = questions.map((currentQuestion) => {
      const existing = value.find(
        (entry) => entry.question === currentQuestion,
      );

      return {
        question: currentQuestion,
        answer: currentQuestion === question ? answer : existing?.answer || "",
      };
    });

    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingIcon}>
          <Text style={styles.headingIconText}>✓</Text>
        </View>

        <View style={styles.headingTextContainer}>
          <Text style={styles.title}>Ownership verification</Text>
          <Text style={styles.subtitle}>
            Answer these questions to help verify your claim.
          </Text>
        </View>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>ⓘ</Text>
        <Text style={styles.noticeText}>
          Give accurate details. Your answers may be reviewed by authorized
          campus staff.
        </Text>
      </View>

      {answers.map((entry, index) => (
        <View key={entry.question} style={styles.questionCard}>
          <View style={styles.questionHeading}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>

            <Text style={styles.questionText}>{entry.question}</Text>
          </View>

          <TextInput
            value={entry.answer}
            onChangeText={(text) => updateAnswer(entry.question, text)}
            editable={!disabled}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Write your answer here..."
            placeholderTextColor="#9AA1AD"
            style={[styles.answerInput, disabled && styles.disabledInput]}
          />

          <Text style={styles.characterCount}>{entry.answer.length}/500</Text>
        </View>
      ))}

      {!!error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#E9F5EF",
    alignItems: "center",
    justifyContent: "center",
  },
  headingIconText: {
    color: "#16834B",
    fontSize: 22,
    fontWeight: "800",
  },
  headingTextContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "800",
  },
  subtitle: {
    color: "#727B8A",
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },
  noticeIcon: {
    color: "#2563A6",
    fontSize: 16,
    fontWeight: "800",
  },
  noticeText: {
    flex: 1,
    color: "#315A86",
    fontSize: 12,
    lineHeight: 18,
  },
  questionCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    gap: 11,
  },
  questionHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  numberCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: "#4057B2",
    fontSize: 12,
    fontWeight: "800",
  },
  questionText: {
    flex: 1,
    color: "#263247",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  answerInput: {
    minHeight: 95,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 11,
    backgroundColor: "#FAFBFD",
    color: "#1D2939",
    fontSize: 13,
    lineHeight: 20,
  },
  disabledInput: {
    opacity: 0.6,
  },
  characterCount: {
    color: "#9AA1AD",
    fontSize: 10,
    textAlign: "right",
  },
  errorText: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default VerificationQuestions;
