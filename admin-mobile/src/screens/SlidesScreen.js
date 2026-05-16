import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, ScrollView, Switch,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { slidesApi } from '../lib/api'
import { COLORS } from '../config'

const EMPTY = { title: '', subtitle: '', imageUrl: '', linkUrl: '/products', linkLabel: 'Shop Now', isActive: true }

const F = ({ label, children }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.fieldLabel}>{label}</Text>
    {children}
  </View>
)

export default function SlidesScreen() {
  const [slides,   setSlides]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [refresh,  setRefresh]  = useState(false)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editId,   setEditId]   = useState(null)
  const [saving,   setSaving]   = useState(false)
  const insets = useSafeAreaInsets()

  const load = async (r = false) => {
    if (r) setRefresh(true); else setLoading(true)
    try { setSlides(await slidesApi.getAll()) }
    catch (e) { console.error(e) }
    finally { setLoading(false); setRefresh(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (sl) => {
    setForm({ title: sl.title, subtitle: sl.subtitle || '', imageUrl: sl.imageUrl || '', linkUrl: sl.linkUrl || '/products', linkLabel: sl.linkLabel || 'Shop Now', isActive: !!sl.isActive })
    setEditId(sl._id); setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return Alert.alert('Validation', 'Title is required')
    setSaving(true)
    try {
      if (editId) await slidesApi.update(editId, form)
      else        await slidesApi.create(form)
      setModal(false); load()
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message) }
    finally { setSaving(false) }
  }

  const del = (id, title) => {
    Alert.alert('Delete Slide', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await slidesApi.delete(id); load() }
        catch (e) { Alert.alert('Error', 'Could not delete slide') }
      }},
    ])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const renderSlide = ({ item: sl, index }) => (
    <View style={s.card}>
      <View style={s.cardRow}>
        <View style={[s.badge, { backgroundColor: sl.isActive ? '#dcfce7' : '#f5f5f5' }]}>
          <Text style={[s.badgeText, { color: sl.isActive ? '#16a34a' : '#aaa' }]}>
            {sl.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => openEdit(sl)} style={s.iconBtn}>
            <Feather name="edit-2" size={15} color={COLORS.primary}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => del(sl._id, sl.title)} style={s.iconBtn}>
            <Feather name="trash-2" size={15} color={COLORS.danger}/>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={s.slideTitle} numberOfLines={1}>{sl.title}</Text>
      {sl.subtitle ? <Text style={s.slideSub} numberOfLines={1}>{sl.subtitle}</Text> : null}
      {sl.imageUrl ? (
        <Text style={s.slideUrl} numberOfLines={1}>{sl.imageUrl}</Text>
      ) : (
        <Text style={s.noImage}>No image URL set</Text>
      )}
    </View>
  )

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Hero Slides ({slides.length})</Text>
        <TouchableOpacity onPress={openAdd} style={s.addBtn}>
          <Feather name="plus" size={18} color={COLORS.secondary}/>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={s.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={slides}
          keyExtractor={sl => sl._id}
          renderItem={renderSlide}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
          ListEmptyComponent={<Text style={s.empty}>No slides yet. Tap + to add one.</Text>}
        />
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <ScrollView contentContainerStyle={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editId ? 'Edit Slide' : 'New Slide'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Feather name="x" size={22} color="#888"/>
            </TouchableOpacity>
          </View>

          <F label="Title *">
            <TextInput style={s.input} value={form.title} onChangeText={v => set('title', v)} placeholder="e.g. Summer Collection"/>
          </F>
          <F label="Subtitle">
            <TextInput style={s.input} value={form.subtitle} onChangeText={v => set('subtitle', v)} placeholder="e.g. Up to 40% off"/>
          </F>
          <F label="Image URL (Cloudinary / ImgBB)">
            <TextInput style={s.input} value={form.imageUrl} onChangeText={v => set('imageUrl', v)} placeholder="https://res.cloudinary.com/..." autoCapitalize="none"/>
          </F>
          <F label="Link URL">
            <TextInput style={s.input} value={form.linkUrl} onChangeText={v => set('linkUrl', v)} placeholder="/products" autoCapitalize="none"/>
          </F>
          <F label="Button Label">
            <TextInput style={s.input} value={form.linkLabel} onChangeText={v => set('linkLabel', v)} placeholder="Shop Now"/>
          </F>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={s.fieldLabel}>Active</Text>
            <Switch value={form.isActive} onValueChange={v => set('isActive', v)} trackColor={{ true: COLORS.primary }}/>
          </View>

          <View style={s.modalActions}>
            <TouchableOpacity onPress={() => setModal(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={save} disabled={saving} style={[s.saveBtn, { opacity: saving ? 0.6 : 1 }]}>
              <Text style={s.saveText}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f7f7f7' },
  header:      { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  addBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#eee' },
  cardRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:   { fontSize: 11, fontWeight: '700' },
  actions:     { flexDirection: 'row', gap: 8 },
  iconBtn:     { padding: 6 },
  slideTitle:  { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  slideSub:    { fontSize: 13, color: '#555', marginBottom: 4 },
  slideUrl:    { fontSize: 11, color: '#aaa' },
  noImage:     { fontSize: 11, color: '#f59e0b', fontStyle: 'italic' },
  empty:       { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
  modal:       { padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  fieldLabel:  { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff', marginBottom: 0 },
  modalActions:{ flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:   { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cancelText:  { fontSize: 14, color: '#888', fontWeight: '500' },
  saveBtn:     { flex: 2, paddingVertical: 13, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText:    { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
})
