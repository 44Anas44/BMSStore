import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { diagnosticsApi } from '../lib/api'
import { COLORS } from '../config'

const STATUSES     = ['waiting','being_treated','problem_detected','repairing','repaired']
const STATUS_LABELS = { waiting:'Waiting', being_treated:'Being Treated', problem_detected:'Problem Detected', repairing:'Repairing', repaired:'Repaired' }
const STATUS_COLORS = { waiting:'#f59e0b', being_treated:'#3b82f6', problem_detected:'#8b5cf6', repairing:'#06b6d4', repaired:'#22c55e' }
const STATUS_BG     = { waiting:'#fef3c7', being_treated:'#dbeafe', problem_detected:'#ede9fe', repairing:'#cffafe', repaired:'#dcfce7' }

const EMPTY_FORM = { orderId:'', code:'', deviceInfo:'', problem:'', price:'', status:'waiting', notes:'', customer:{ name:'', phone:'', email:'' } }

const F = ({ label, children }) => (
  <View style={{ marginBottom: 13 }}>
    <Text style={s.fieldLabel}>{label}</Text>
    {children}
  </View>
)

export default function DiagnosticsScreen() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [refresh,  setRefresh]  = useState(false)
  const [filter,   setFilter]   = useState('')
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [editId,   setEditId]   = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [expanded, setExpanded] = useState(null)
  const insets = useSafeAreaInsets()

  const load = async (r = false) => {
    if (r) setRefresh(true); else setLoading(true)
    try { setItems(await diagnosticsApi.getAll(filter ? { status: filter } : {})) }
    catch (e) { console.error(e) }
    finally { setLoading(false); setRefresh(false) }
  }
  useEffect(() => { load() }, [filter])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  const openEdit = (d) => {
    setForm({
      orderId: d.orderId, code: d.code, deviceInfo: d.deviceInfo || '',
      problem: d.problem || '', price: d.price != null ? String(d.price) : '',
      status: d.status, notes: d.notes || '',
      customer: { name: d.customer?.name || '', phone: d.customer?.phone || '', email: d.customer?.email || '' },
    })
    setEditId(d._id); setModal(true)
  }

  const save = async () => {
    if (!form.orderId.trim() || !form.code.trim()) return Alert.alert('Validation', 'Order ID and secret code are required')
    setSaving(true)
    try {
      const payload = { ...form, price: form.price !== '' ? parseFloat(form.price) : null }
      if (editId) await diagnosticsApi.update(editId, payload)
      else        await diagnosticsApi.create(payload)
      setModal(false); load()
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message) }
    finally { setSaving(false) }
  }

  const del = (id, orderId) => {
    Alert.alert('Delete',`Delete diagnostic for order "\${orderId}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await diagnosticsApi.delete(id); load() }
        catch (e) { Alert.alert('Error', 'Could not delete') }
      }},
    ])
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setCust  = (k, v) => setForm(f => ({ ...f, customer: { ...f.customer, [k]: v } }))

  const renderItem = ({ item: d }) => {
    const isOpen = expanded === d._id
    const sc = STATUS_COLORS[d.status] || '#888'
    const sb = STATUS_BG[d.status]    || '#f5f5f5'
    return (
      <View style={s.card}>
        <TouchableOpacity onPress={() => setExpanded(isOpen ? null : d._id)} style={s.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:3 }}>
              <Text style={s.orderId}>#{d.orderId}</Text>
              <View style={[s.pill, { backgroundColor: sb }]}>
                <Text style={[s.pillText, { color: sc }]}>{STATUS_LABELS[d.status]}</Text>
              </View>
              {d.priceConfirmed && (
                <View style={[s.pill, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[s.pillText, { color: '#16a34a' }]}>✓ Confirmed</Text>
                </View>
              )}
            </View>
            {d.customer?.name ? <Text style={s.custName}>{d.customer.name}</Text> : null}
            {d.deviceInfo ? <Text style={s.sub} numberOfLines={1}>{d.deviceInfo}</Text> : null}
          </View>
          <View style={{ alignItems:'flex-end', gap:4 }}>
            {d.price != null ? <Text style={s.price}>{(+d.price).toFixed(2)} TND</Text> : null}
            <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#bbb"/>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={s.expansion}>
            {d.problem ? (
              <><Text style={s.expLabel}>Problem</Text><Text style={s.expVal}>{d.problem}</Text></>
            ) : null}
            {d.notes ? (
              <><Text style={s.expLabel}>Notes</Text><Text style={s.expVal}>{d.notes}</Text></>
            ) : null}
            {d.customer?.phone ? (
              <><Text style={s.expLabel}>Phone</Text><Text style={s.expVal}>{d.customer.phone}</Text></>
            ) : null}
            <Text style={s.expLabel}>Secret Code</Text>
            <Text style={[s.expVal, { fontFamily: 'monospace', letterSpacing: 1 }]}>{d.code}</Text>
            <View style={s.expActions}>
              <TouchableOpacity onPress={() => openEdit(d)} style={s.editBtn}>
                <Feather name="edit-2" size={14} color={COLORS.primary}/>
                <Text style={[s.expBtnTxt, { color: COLORS.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => del(d._id, d.orderId)} style={s.delBtn}>
                <Feather name="trash-2" size={14} color={COLORS.danger}/>
                <Text style={[s.expBtnTxt, { color: COLORS.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Diagnostics ({items.length})</Text>
        <TouchableOpacity onPress={openAdd} style={s.addBtn}>
          <Feather name="plus" size={18} color={COLORS.secondary}/>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
        {['', ...STATUSES].map(st => (
          <TouchableOpacity key={st} onPress={() => setFilter(st)}
            style={[s.filterBtn, filter === st && { backgroundColor: COLORS.primary }]}>
            <Text style={[s.filterText, filter === st && { color: COLORS.secondary }]}>
              {st ? STATUS_LABELS[st] : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <Text style={s.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={d => d._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
          ListEmptyComponent={<Text style={s.empty}>No diagnostics{filter ? ' with this status' : ' yet'}</Text>}
        />
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <ScrollView contentContainerStyle={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editId ? 'Edit Diagnostic' : 'New Diagnostic'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Feather name="x" size={22} color="#888"/>
            </TouchableOpacity>
          </View>

          <Text style={[s.fieldLabel, { marginBottom: 10, color: '#6b7280' }]}>Order Info</Text>
          <F label="Order ID *">
            <TextInput style={s.input} value={form.orderId} onChangeText={v => setField('orderId', v)} placeholder="e.g. REP-001" autoCapitalize="characters"/>
          </F>
          <F label="Secret Code (shared with customer) *">
            <TextInput style={s.input} value={form.code} onChangeText={v => setField('code', v)} placeholder="e.g. A4F9" autoCapitalize="characters"/>
          </F>
          <F label="Device Info">
            <TextInput style={s.input} value={form.deviceInfo} onChangeText={v => setField('deviceInfo', v)} placeholder="e.g. iPhone 13 Pro, cracked screen"/>
          </F>

          <Text style={[s.fieldLabel, { marginBottom: 10, marginTop: 6, color: '#6b7280' }]}>Customer</Text>
          <F label="Name">
            <TextInput style={s.input} value={form.customer.name} onChangeText={v => setCust('name', v)} placeholder="Customer name"/>
          </F>
          <F label="Phone">
            <TextInput style={s.input} value={form.customer.phone} onChangeText={v => setCust('phone', v)} placeholder="+216 xx xxx xxx" keyboardType="phone-pad"/>
          </F>

          <Text style={[s.fieldLabel, { marginBottom: 10, marginTop: 6, color: '#6b7280' }]}>Diagnosis</Text>
          <F label="Status">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 0 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {STATUSES.map(st => (
                  <TouchableOpacity key={st} onPress={() => setField('status', st)}
                    style={[s.statusBtn, form.status === st && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                    <Text style={[s.statusBtnTxt, form.status === st && { color: COLORS.secondary }]}>{STATUS_LABELS[st]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </F>
          <F label="Problem Detected">
            <TextInput style={[s.input, { height: 70, textAlignVertical: 'top' }]} value={form.problem} onChangeText={v => setField('problem', v)} placeholder="Describe the issue..." multiline/>
          </F>
          <F label="Repair Price (TND)">
            <TextInput style={s.input} value={form.price} onChangeText={v => setField('price', v)} placeholder="e.g. 120" keyboardType="decimal-pad"/>
          </F>
          <F label="Internal Notes">
            <TextInput style={[s.input, { height: 70, textAlignVertical: 'top' }]} value={form.notes} onChangeText={v => setField('notes', v)} placeholder="Notes for your team..." multiline/>
          </F>

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
  container:    { flex: 1, backgroundColor: '#f7f7f7' },
  header:       { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  addBtn:       { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  filterScroll: { flexGrow: 0 },
  filterBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#eee' },
  filterText:   { fontSize: 12, fontWeight: '500', color: '#555' },
  card:         { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 0.5, borderColor: '#eee' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  orderId:      { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  pill:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  pillText:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  custName:     { fontSize: 13, color: '#555', marginBottom: 2 },
  sub:          { fontSize: 12, color: '#aaa' },
  price:        { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  expansion:    { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 0.5, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa' },
  expLabel:     { fontSize: 10, fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 3 },
  expVal:       { fontSize: 13, color: '#444', lineHeight: 18 },
  expActions:   { flexDirection: 'row', gap: 10, marginTop: 14 },
  editBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#eff6ff', borderWidth: 0.5, borderColor: '#bfdbfe' },
  delBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fef2f2', borderWidth: 0.5, borderColor: '#fecaca' },
  expBtnTxt:    { fontSize: 13, fontWeight: '600' },
  empty:        { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
  modal:        { padding: 20, paddingBottom: 40 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  fieldLabel:   { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:        { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  statusBtn:    { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#f9f9f9' },
  statusBtnTxt: { fontSize: 12, fontWeight: '500', color: '#555' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:    { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cancelText:   { fontSize: 14, color: '#888', fontWeight: '500' },
  saveBtn:      { flex: 2, paddingVertical: 13, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText:     { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
})
