import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { brandsApi } from '../lib/api'
import { COLORS } from '../config'

export default function BrandsScreen() {
  const [brands,  setBrands]  = useState([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(false)
  const [modal,   setModal]   = useState(false)
  const [name,    setName]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const insets = useSafeAreaInsets()

  const load = async (r = false) => {
    if (r) setRefresh(true); else setLoading(true)
    try { setBrands(await brandsApi.getAll()) }
    catch (e) { console.error(e) }
    finally { setLoading(false); setRefresh(false) }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Brand name is required')
    setSaving(true)
    try {
      await brandsApi.create({ name: name.trim() })
      setName(''); setModal(false); load()
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message) }
    finally { setSaving(false) }
  }

  const del = (id, brandName) => {
    Alert.alert('Delete Brand', `Delete "${brandName}"? Products using this brand will lose their brand.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await brandsApi.delete(id); load() }
        catch (e) { Alert.alert('Error', 'Could not delete brand') }
      }},
    ])
  }

  const renderBrand = ({ item: b }) => (
    <View style={s.card}>
      <View style={s.dot}/>
      <Text style={s.brandName}>{b.name}</Text>
      <TouchableOpacity onPress={() => del(b._id, b.name)} style={s.delBtn}>
        <Feather name="trash-2" size={15} color={COLORS.danger}/>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Brands ({brands.length})</Text>
        <TouchableOpacity onPress={() => { setName(''); setModal(true) }} style={s.addBtn}>
          <Feather name="plus" size={18} color={COLORS.secondary}/>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={s.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={brands}
          keyExtractor={b => b._id}
          renderItem={renderBrand}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
          ListEmptyComponent={<Text style={s.empty}>No brands yet. Tap + to add one.</Text>}
        />
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <ScrollView contentContainerStyle={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Brand</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Feather name="x" size={22} color="#888"/>
            </TouchableOpacity>
          </View>
          <Text style={s.fieldLabel}>Brand Name *</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Samsung, Apple, Sony"
            autoFocus
          />
          <View style={[s.modalActions, { marginTop: 20 }]}>
            <TouchableOpacity onPress={() => setModal(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={save} disabled={saving} style={[s.saveBtn, { opacity: saving ? 0.6 : 1 }]}>
              <Text style={s.saveText}>{saving ? 'Saving...' : 'Create'}</Text>
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
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: '#eee' },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  brandName:   { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  delBtn:      { padding: 6 },
  empty:       { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
  modal:       { padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  fieldLabel:  { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  modalActions:{ flexDirection: 'row', gap: 10 },
  cancelBtn:   { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cancelText:  { fontSize: 14, color: '#888', fontWeight: '500' },
  saveBtn:     { flex: 2, paddingVertical: 13, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText:    { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
})
