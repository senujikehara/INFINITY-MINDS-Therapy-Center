import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function ParentDashboard({ onLogout }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Malkanthi Wijesinghe</Text>
          <Text style={styles.role}>Parent Account (Ethan's Guardian)</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications bell count */}
      <View style={styles.notificationAlert}>
        <Text style={styles.notifTitle}>🔔 Parent Alerts Feed</Text>
        <Text style={styles.notifText}>• Behavior report review finalized for Ethan.</Text>
      </View>

      {/* Section 1 - Progress reports (Instant) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ethan's Progress Logs</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.badgeText}>Speech Therapy Log</Text>
          <Text style={styles.date}>2026-07-01</Text>
        </View>
        <Text style={styles.reportNotes}>
          Ethan successfully identified 8/10 picture cards today. We will focus on blending next week.
        </Text>
        <Text style={styles.attachment}>📎 View attached cards photo.jpg</Text>
        {/* PDF template rules will hide trainer names when downloading */}
        <TouchableOpacity style={styles.pdfBtn}>
          <Text style={styles.pdfBtnText}>Download Official PDF (Concealed Trainer Name)</Text>
        </TouchableOpacity>
      </View>

      {/* Section 2 - Behavior Reports (Principal Authorization Gated) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Authorized Behavior Reports</Text>
      </View>

      <View style={[styles.card, { borderLeftColor: '#10b981', borderLeftWidth: 4 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.badgeText, { color: '#10b981' }]}>Behavior Status - Approved</Text>
          <Text style={styles.date}>2026-07-01</Text>
        </View>
        
        <View style={styles.behaviorContent}>
          <Text style={styles.subHeading}>Positive Observations:</Text>
          <Text style={styles.notesText}>Ethan engaged well in verbal modeling exercises, attempting multi-syllable words.</Text>
          
          <Text style={styles.subHeading}>Challenges Address:</Text>
          <Text style={styles.notesText}>Lost focus in the last 15 minutes, showed minor repetitive behaviors when tired.</Text>

          <Text style={styles.subHeading}>Principal Sign-off Commentary:</Text>
          <Text style={[styles.notesText, { fontStyle: 'italic', color: '#f59e0b' }]}>
            "Approved. Good progress with articulation controls." - Dr. Kanishka
          </Text>
        </View>

        <TouchableOpacity style={styles.pdfBtn}>
          <Text style={styles.pdfBtnText}>Download Official PDF (Concealed Trainer Name)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0716',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  logout: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  logoutText: {
    color: '#f8fafc',
    fontSize: 12,
  },
  notificationAlert: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  notifTitle: {
    color: '#a78bfa',
    fontWeight: 'bold',
    fontSize: 13,
  },
  notifText: {
    color: '#f8fafc',
    fontSize: 12,
  },
  sectionHeader: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(22, 16, 38, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textTransform: 'uppercase',
  },
  date: {
    color: '#94a3b8',
    fontSize: 12,
  },
  reportNotes: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  attachment: {
    color: '#8b5cf6',
    fontSize: 12,
  },
  behaviorContent: {
    gap: 6,
  },
  subHeading: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notesText: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18,
  },
  pdfBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  pdfBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '500',
  },
});
