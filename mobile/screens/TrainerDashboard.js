import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export default function TrainerDashboard({ onLogout }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [notes, setNotes] = useState('');
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hello, Dinuka</Text>
          <Text style={styles.role}>Trainer Accounts</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* active session block */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Active Session Block</Text>
          <Text style={styles.time}>09:00 - 10:00</Text>
        </View>
        
        <Text style={styles.studentName}>Student: Ethan Wijesinghe</Text>
        <Text style={styles.therapyType}>Speech Therapy Program</Text>

        {/* Health alert visible next to session */}
        <View style={styles.healthAlert}>
          <Text style={styles.healthTitle}>⚠️ Health Profile Summary</Text>
          <Text style={styles.healthText}>• Allergies: Peanut allergy</Text>
          <Text style={styles.healthText}>• Conditions: Mild asthma (Inhaler in bag)</Text>
          <Text style={styles.healthText}>• Accommodations: Requires visual schedule aids</Text>
        </View>

        {/* Check in out */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.btn, checkedIn && styles.btnDisabled]} 
            disabled={checkedIn}
            onPress={() => setCheckedIn(true)}
          >
            <Text style={styles.btnText}>{checkedIn ? "Checked In ✓" : "Mark Check-In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#10b981' }, (!checkedIn || checkedOut) && styles.btnDisabled]} 
            disabled={!checkedIn || checkedOut}
            onPress={() => setCheckedOut(true)}
          >
            <Text style={styles.btnText}>{checkedOut ? "Completed ✓" : "Mark Check-Out"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice-to-Text Clinical Entry Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report clinical progress log</Text>
        
        <View style={styles.voiceRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="Type or dictate progress notes..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
          <TouchableOpacity style={styles.micButton} onPress={() => setNotes(prev => prev + " [Dictated voice notes: Student achieved articulation objectives today]")}>
            <Text style={styles.micText}>🎙️</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Submit Report</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  time: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  therapyType: {
    color: '#94a3b8',
    fontSize: 13,
  },
  healthAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  healthTitle: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 13,
  },
  healthText: {
    color: '#f8fafc',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  voiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  micText: {
    fontSize: 20,
  },
  submitBtn: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
