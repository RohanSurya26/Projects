import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function ProfileScreen() {
  const { colors: c, mode, toggle } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHotelSettings, setShowHotelSettings] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState('English');
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Editable profile
  const [profileName, setProfileName] = useState('Admin User');
  const [profileEmail, setProfileEmail] = useState('admin@lumina.com');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const openEditProfile = () => {
    setEditName(profileName);
    setEditEmail(profileEmail);
    setEditPhone(profilePhone);
    setShowEditProfile(true);
  };

  const saveProfile = () => {
    if (!editName.trim()) { Alert.alert('Required', 'Name is required'); return; }
    setProfileName(editName.trim());
    setProfileEmail(editEmail.trim());
    setProfilePhone(editPhone.trim());
    setShowEditProfile(false);
    Alert.alert('Saved', 'Profile updated successfully');
  };

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'];

  const staff = [
    { name: 'Rajesh Kumar', role: 'Front Desk', status: 'On Duty', shift: 'Morning' },
    { name: 'Meena Devi', role: 'Housekeeping', status: 'On Duty', shift: 'Morning' },
    { name: 'Suresh Patel', role: 'Restaurant Manager', status: 'On Duty', shift: 'Afternoon' },
    { name: 'Anita Gupta', role: 'Receptionist', status: 'Off Duty', shift: 'Night' },
    { name: 'Vikram Singh', role: 'Security', status: 'On Duty', shift: 'Morning' },
    { name: 'Pooja Sharma', role: 'Chef', status: 'On Duty', shift: 'Morning' },
  ];

  const helpItems = [
    { q: 'How to check in a guest?', a: 'Go to Rooms tab → tap an available room → tap "Book Now" → fill in guest details and confirm.' },
    { q: 'How to create a new order?', a: 'Go to Billing tab → search or browse menu items → tap items to add to cart → tap Checkout.' },
    { q: 'How to change room status?', a: 'Go to Rooms tab → tap any room → use the action buttons to checkout, mark maintenance, or make available.' },
    { q: 'How to switch themes?', a: 'Go to Profile tab → Appearance section → toggle the Dark Mode switch.' },
    { q: 'How to export reports?', a: 'Reports are available on the web dashboard at lumina.app/reports.' },
  ];

  function SettingsItem({ icon, label, value, onPress, rightComponent }: {
    icon: IconName; label: string; value?: string; onPress?: () => void; rightComponent?: React.ReactNode;
  }) {
    return (
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border }} activeOpacity={0.6} onPress={onPress}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.accent + '18', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
          <Ionicons name={icon} size={18} color={c.accent} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: c.text }}>{label}</Text>
        {rightComponent || (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {value ? <Text style={{ fontSize: 13, color: c.textMuted, marginRight: 6 }}>{value}</Text> : null}
            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Reusable modal shell
  function ModalSheet({ visible, title, onClose, children }: {
    visible: boolean; title: string; onClose: () => void; children: React.ReactNode;
  }) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                <Ionicons name="close" size={18} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {/* Profile Card */}
          <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
            <LinearGradient colors={[c.accent, c.accentDark]} style={{ width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{profileName.charAt(0)}</Text>
            </LinearGradient>
            <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 4 }}>{profileName}</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, marginBottom: 12 }}>{profileEmail}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.accent + '18', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}>
              <Ionicons name="shield-checkmark" size={12} color={c.accent} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.accent }}> Administrator</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {[{ val: '124', lbl: 'Bookings' }, { val: '₹43L', lbl: 'Revenue' }, { val: '98%', lbl: 'Rating' }].map((s, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: c.card, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: c.border, marginLeft: i > 0 ? 6 : 0, marginRight: i < 2 ? 6 : 0 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 4 }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: c.textSecondary, fontWeight: '500' }}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* APPEARANCE */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>APPEARANCE</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.accent + '18', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={18} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Dark Mode</Text>
                <Text style={{ fontSize: 11, color: c.textSecondary }}>{mode === 'dark' ? 'Currently dark' : 'Currently light'}</Text>
              </View>
              <Switch value={mode === 'dark'} onValueChange={toggle} trackColor={{ false: '#e2e8f0', true: c.accent + '60' }} thumbColor={mode === 'dark' ? c.accent : '#fff'} />
            </View>
          </View>

          {/* GENERAL */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>GENERAL</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            <SettingsItem icon="person-outline" label="Edit Profile" onPress={openEditProfile} />
            <SettingsItem icon="notifications-outline" label="Notifications" rightComponent={
              <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: '#e2e8f0', true: c.accent + '60' }} thumbColor={notifEnabled ? c.accent : '#fff'} />
            } />
            <SettingsItem icon="language-outline" label="Language" value={selectedLang} onPress={() => setShowLangPicker(true)} />
          </View>

          {/* BUSINESS */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>BUSINESS</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            <SettingsItem icon="business-outline" label="Hotel Settings" onPress={() => setShowHotelSettings(true)} />
            <SettingsItem icon="people-outline" label="Staff Management" onPress={() => setShowStaff(true)} />
            <SettingsItem icon="receipt-outline" label="Billing Preferences" onPress={() => router.navigate('/(tabs)/billing')} />
            <SettingsItem icon="stats-chart-outline" label="Reports" onPress={() => Alert.alert('Reports', 'Detailed reports are available on the web dashboard.')} />
          </View>

          {/* SUPPORT */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>SUPPORT</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            <SettingsItem icon="help-circle-outline" label="Help Center" onPress={() => setShowHelp(true)} />
            <SettingsItem icon="chatbubble-outline" label="Contact Support" onPress={() => Alert.alert('Contact Support', 'Email: support@lumina.app\nPhone: +91 1800-123-4567\nHours: 9 AM - 9 PM IST')} />
            <SettingsItem icon="document-text-outline" label="Terms & Privacy" onPress={() => Alert.alert('Terms & Privacy', 'By using Lumina Hotel Management, you agree to our Terms of Service and Privacy Policy.\n\nData is encrypted and stored securely.\n\nContact us for data deletion requests.')} />
          </View>

          {/* Logout */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.danger + '10', borderRadius: 16, paddingVertical: 16, marginTop: 24, borderWidth: 1, borderColor: c.danger + '25' }} onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/') },
            ]);
          }} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={c.danger} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.danger, marginLeft: 8 }}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', color: c.textMuted, fontSize: 12, marginTop: 20, marginBottom: 30 }}>Lumina Hotel Management v1.0.0</Text>
        </ScrollView>

        {/* ====== EDIT PROFILE MODAL ====== */}
        <ModalSheet visible={showEditProfile} title="Edit Profile" onClose={() => setShowEditProfile(false)}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>FULL NAME</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
            <TextInput style={{ paddingVertical: 14, fontSize: 15, color: c.text }} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={c.textMuted} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>EMAIL</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
            <TextInput style={{ paddingVertical: 14, fontSize: 15, color: c.text }} value={editEmail} onChangeText={setEditEmail} placeholder="your@email.com" placeholderTextColor={c.textMuted} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>PHONE</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, marginBottom: 24 }}>
            <TextInput style={{ paddingVertical: 14, fontSize: 15, color: c.text }} value={editPhone} onChangeText={setEditPhone} placeholder="+91..." placeholderTextColor={c.textMuted} keyboardType="phone-pad" />
          </View>
          <TouchableOpacity onPress={saveProfile} style={{ borderRadius: 14, overflow: 'hidden' }}>
            <LinearGradient colors={[c.accent, c.accentDark]} style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ModalSheet>

        {/* ====== LANGUAGE PICKER MODAL ====== */}
        <ModalSheet visible={showLangPicker} title="Select Language" onClose={() => setShowLangPicker(false)}>
          {languages.map(lang => (
            <TouchableOpacity key={lang} onPress={() => { setSelectedLang(lang); setShowLangPicker(false); }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1.5, borderColor: selectedLang === lang ? c.accent : c.border }}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: c.text }}>{lang}</Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedLang === lang ? c.accent : c.border, justifyContent: 'center', alignItems: 'center' }}>
                {selectedLang === lang && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.accent }} />}
              </View>
            </TouchableOpacity>
          ))}
        </ModalSheet>

        {/* ====== HOTEL SETTINGS MODAL ====== */}
        <ModalSheet visible={showHotelSettings} title="Hotel Settings" onClose={() => setShowHotelSettings(false)}>
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden', marginBottom: 16 }}>
            {[
              { l: 'Hotel Name', v: 'Lumina Grand Hotel' },
              { l: 'GST Number', v: '27AABCU9603R1ZM' },
              { l: 'Address', v: 'Bandra West, Mumbai 400050' },
              { l: 'Phone', v: '+91 22 2640 1234' },
              { l: 'Email', v: 'info@lumina.com' },
              { l: 'Check-in Time', v: '2:00 PM' },
              { l: 'Check-out Time', v: '11:00 AM' },
              { l: 'Total Rooms', v: '100' },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
                <Text style={{ fontSize: 13, color: c.textSecondary }}>{item.l}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: c.text, maxWidth: '55%', textAlign: 'right' }}>{item.v}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'center' }}>Hotel settings can be edited from the web dashboard</Text>
        </ModalSheet>

        {/* ====== STAFF MODAL ====== */}
        <ModalSheet visible={showStaff} title="Staff Management" onClose={() => setShowStaff(false)}>
          {staff.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
              <LinearGradient colors={[c.accent + '30', c.accentDark + '30']} style={{ width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: c.accent }}>{s.name.charAt(0)}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{s.name}</Text>
                <Text style={{ fontSize: 12, color: c.textSecondary }}>{s.role} • {s.shift} Shift</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: s.status === 'On Duty' ? c.success + '18' : c.textMuted + '18' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: s.status === 'On Duty' ? c.success : c.textMuted }}>{s.status}</Text>
              </View>
            </View>
          ))}
        </ModalSheet>

        {/* ====== HELP CENTER MODAL ====== */}
        <ModalSheet visible={showHelp} title="Help Center" onClose={() => setShowHelp(false)}>
          {helpItems.map((h, i) => (
            <View key={i} style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="help-circle" size={18} color={c.accent} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text, marginLeft: 8 }}>{h.q}</Text>
              </View>
              <Text style={{ fontSize: 13, color: c.textSecondary, lineHeight: 20, paddingLeft: 26 }}>{h.a}</Text>
            </View>
          ))}
        </ModalSheet>
      </SafeAreaView>
    </View>
  );
}
