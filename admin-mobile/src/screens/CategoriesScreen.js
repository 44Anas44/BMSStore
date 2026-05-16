import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, RefreshControl, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { categoriesApi, brandsApi } from '../lib/api'
import { COLORS } from '../config'

export default function CategoriesScreen() {
  const [cats,    setCats]    = useState([])
  const [brands,  setBrands]  = useState([])
  const [refresh, setRefresh] = useState(false)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({ name:'', parent:'' })
  const [brand,   setBrand]   = useState('')
  const [tab,     setTab]     = useState('cats')
  const insets = useSafeAreaInsets()

  const loadCats   = async () => setCats(await categoriesApi.getAll().catch(() => []))
  const loadBrands = async () => setBrands(await brandsApi.getAll().catch(() => []))
  const load = async (r=false) => {
    if (r) setRefresh(true)
    await Promise.all([loadCats(), loadBrands()])
    setRefresh(false)
  }
  useEffect(() => { load() }, [])

  const addCat = async () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Enter a category name')
    try {
      await categoriesApi.create({ name: form.name.trim(), parent: form.parent || null })
      setModal(null); setForm({ name:'', parent:'' }); loadCats()
    } catch (e) { Alert.alert('Error', e.message) }
  }

  const delCat = (id, name) => Alert.alert('Delete', `Delete "${name}" and all subcategories?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await categoriesApi.delete(id); loadCats() } },
  ])

  const addBrand = async () => {
    if (!brand.trim()) return
    try { await brandsApi.create({ name: brand.trim() }); setBrand(''); loadBrands() }
    catch (e) { Alert.alert('Error', e.message) }
  }

  const delBrand = (id, name) => Alert.alert('Delete', `Delete brand "${name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await brandsApi.delete(id); loadBrands() } },
  ])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories & Brands</Text>
      </View>
      <View style={styles.tabRow}>
        {['cats','brands'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, tab === t && { color: COLORS.primary }]}>{t === 'cats' ? 'Categories' : 'Brands'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'cats' ? (
        <>
          <TouchableOpacity style={styles.addRow} onPress={() => { setForm({ name:'', parent:'' }); setModal('cat') }}>
            <Feather name="plus" size={16} color={COLORS.primary}/>
            <Text style={[styles.addRowText, { color: COLORS.primary }]}>Add Category</Text>
          </TouchableOpacity>
          <FlatList data={cats} keyExtractor={c => c._id}
            refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={styles.empty}>No categories yet</Text>}
            renderItem={({ item: c }) => (
              <View style={[styles.catRow, c.parent && { paddingLeft: 28 }]}>
                {c.parent && <Text style={styles.indent}>└</Text>}
                <Text style={[styles.catName, !c.parent && { fontWeight: '600' }]}>{c.name}</Text>
                <View style={styles.catActions}>
                  <TouchableOpacity onPress={() => { setForm({ name:'', parent: c._id }); setModal('cat') }}>
                    <Text style={styles.subBtn}>+ Sub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => delCat(c._id, c.name)}>
                    <Feather name="trash-2" size={14} color="#ef4444"/>
                  </TouchableOpacity>
                </View>
              </View>
            )}/>
        </>
      ) : (
        <>
          <View style={styles.brandInput}>
            <TextInput value={brand} onChangeText={setBrand} placeholder="Brand name"
              placeholderTextColor="#bbb" style={styles.brandTxt} onSubmitEditing={addBrand}/>
            <TouchableOpacity onPress={addBrand} style={styles.brandAddBtn}>
              <Text style={styles.brandAddTxt}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={brands} keyExtractor={b => b._id}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={styles.empty}>No brands yet</Text>}
            renderItem={({ item: b }) => (
              <View style={styles.brandRow}>
                <View style={styles.brandAvatar}><Text style={styles.brandAvatarText}>{b.name[0].toUpperCase()}</Text></View>
                <Text style={styles.brandName}>{b.name}</Text>
                <TouchableOpacity onPress={() => delBrand(b._id, b.name)}>
                  <Feather name="trash-2" size={15} color="#ef4444"/>
                </TouchableOpacity>
              </View>
            )}/>
        </>
      )}

      <Modal visible={modal === 'cat'} animationType="slide" transparent onRequestClose={() => setModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TextInput value={form.name} onChangeText={v => setForm(f=>({...f,name:v}))}
              placeholder="Category name" placeholderTextColor="#bbb" style={styles.modalInput}/>
            {cats.length > 0 && (
              <View style={styles.parentPick}>
                <Text style={styles.parentLabel}>Parent (optional)</Text>
                {cats.filter(c=>!c.parent).map(c=>(
                  <TouchableOpacity key={c._id} onPress={() => setForm(f=>({...f, parent: f.parent===c._id?'':c._id}))}
                    style={[styles.parentBtn, form.parent===c._id && { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.parentBtnText, form.parent===c._id && { color: COLORS.secondary }]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModal(null)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addCat} style={styles.modalSave}>
                <Text style={styles.modalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f7f7f7' },
  header:         { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  tabRow:         { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tabBtn:         { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:        { fontSize: 14, fontWeight: '500', color: '#888' },
  addRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  addRowText:     { fontSize: 14, fontWeight: '600' },
  catRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 10, borderWidth: 0.5, borderColor: '#eee' },
  indent:         { color: '#ccc', marginRight: 6, fontSize: 14 },
  catName:        { flex: 1, fontSize: 14, color: '#1a1a1a' },
  catActions:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subBtn:         { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  brandInput:     { flexDirection: 'row', gap: 10, margin: 12 },
  brandTxt:       { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#1a1a1a', borderWidth: 0.5, borderColor: '#eee' },
  brandAddBtn:    { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  brandAddTxt:    { color: COLORS.secondary, fontWeight: '700', fontSize: 14 },
  brandRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 10, borderWidth: 0.5, borderColor: '#eee', gap: 12 },
  brandAvatar:    { width: 34, height: 34, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  brandAvatarText:{ fontSize: 14, fontWeight: '700', color: '#aaa' },
  brandName:      { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  empty:          { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:     { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  modalInput:     { backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#1a1a1a', borderWidth: 0.5, borderColor: '#eee', marginBottom: 12 },
  parentLabel:    { fontSize: 11, fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  parentPick:     { marginBottom: 16 },
  parentBtn:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 6 },
  parentBtnText:  { fontSize: 13, fontWeight: '500', color: '#555' },
  modalActions:   { flexDirection: 'row', gap: 10 },
  modalCancel:    { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  modalCancelText:{ fontSize: 14, color: '#888', fontWeight: '500' },
  modalSave:      { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalSaveText:  { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
})
