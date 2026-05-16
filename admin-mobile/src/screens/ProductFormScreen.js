import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { productsApi, uploadApi } from '../lib/api'
import { COLORS } from '../config'

export default function ProductFormScreen({ route, navigation }) {
  const existing = route.params?.product
  const insets   = useSafeAreaInsets()

  const [form, setForm] = useState({
    name:        existing?.name         || '',
    description: existing?.description  || '',
    price:       existing?.price?.toString() || '',
    comparePrice:existing?.comparePrice?.toString() || '',
    stock:       existing?.stock?.toString() || '0',
    images:      existing?.images       || [],
    isPromo:      existing?.isPromo      || false,
    isFeatured:   existing?.isFeatured   || false,
    isNewArrival: existing?.isNewArrival  || false,
    isSecondHand: existing?.isSecondHand  || false,
  })
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, quality: 0.8,
    })
    if (res.canceled || !res.assets?.length) return
    setUploading(true)
    try {
      const uris = res.assets.map(a => a.uri)
      const uploaded = await uploadApi.productImages(uris)
      set('images', [...form.images, ...uploaded.map(u => u.url)].slice(0, 5))
    } catch (e) { Alert.alert('Upload failed', e.message) }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!form.name || !form.price) return Alert.alert('Required', 'Name and price are required')
    setSaving(true)
    try {
      const data = {
        name: form.name, description: form.description,
        price: +form.price,
        comparePrice: form.comparePrice ? +form.comparePrice : null,
        stock: Math.max(0, +form.stock || 0),
        images: form.images,
        isPromo: form.isPromo, isFeatured: form.isFeatured, isNewArrival: form.isNewArrival, isSecondHand: form.isSecondHand,
      }
      if (existing) await productsApi.update(existing._id, data)
      else          await productsApi.create(data)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message)
    } finally { setSaving(false) }
  }

  const F = ({ label, children }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={COLORS.secondary}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? 'Edit Product' : 'Add Product'}</Text>
        <View style={{ width: 36 }}/>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <F label="Product Name *">
          <TextInput value={form.name} onChangeText={v => set('name', v)}
            placeholder="e.g. Classic White Sneaker" placeholderTextColor="#bbb" style={styles.input}/>
        </F>
        <View style={styles.row}>
          <F label="Price (TND) *">
            <TextInput value={form.price} onChangeText={v => set('price', v)}
              keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#bbb" style={[styles.input, styles.halfInput]}/>
          </F>
          <F label="Compare Price">
            <TextInput value={form.comparePrice} onChangeText={v => set('comparePrice', v)}
              keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#bbb" style={[styles.input, styles.halfInput]}/>
          </F>
        </View>
        <F label="Stock">
          <TextInput value={form.stock} onChangeText={v => set('stock', v)}
            keyboardType="number-pad" placeholder="0" placeholderTextColor="#bbb" style={styles.input}/>
        </F>
        <F label="Description">
          <TextInput value={form.description} onChangeText={v => set('description', v)}
            placeholder="Product description..." placeholderTextColor="#bbb"
            multiline numberOfLines={3} style={[styles.input, styles.textarea]}/>
        </F>

        <F label={`Images (${form.images.length}/5) — uploaded to Cloudinary`}>
          <View style={styles.imagesRow}>
            {form.images.map((url, i) => (
              <View key={i} style={styles.imgThumbWrap}>
                <Image source={{ uri: url }} style={styles.imgThumb}/>
                <TouchableOpacity style={styles.imgRemove} onPress={() => set('images', form.images.filter((_,j)=>j!==i))}>
                  <Feather name="x" size={12} color="#fff"/>
                </TouchableOpacity>
              </View>
            ))}
            {form.images.length < 5 && (
              <TouchableOpacity style={styles.imgAdd} onPress={pickImages} disabled={uploading}>
                {uploading
                  ? <ActivityIndicator color={COLORS.primary}/>
                  : <Feather name="image" size={22} color="#bbb"/>
                }
              </TouchableOpacity>
            )}
          </View>
        </F>

        {[['isPromo','On Promotion'],['isFeatured','Featured'],['isNewArrival','New Arrival'],['isSecondHand','Second Hand']].map(([k,l]) => (
          <View key={k} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{l}</Text>
            <Switch value={!!form[k]} onValueChange={v => set(k, v)}
              trackColor={{ true: COLORS.primary }} thumbColor="#fff"/>
          </View>
        ))}

        <TouchableOpacity style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]} onPress={save} disabled={saving}>
          {saving
            ? <ActivityIndicator color={COLORS.secondary}/>
            : <Text style={styles.saveBtnText}>{existing ? 'Save Changes' : 'Create Product'}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f7f7f7' },
  header:      { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.secondary },
  field:       { marginBottom: 14 },
  label:       { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#1a1a1a' },
  halfInput:   { flex: 1 },
  textarea:    { minHeight: 80, textAlignVertical: 'top' },
  row:         { flexDirection: 'row', gap: 10 },
  imagesRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imgThumbWrap:{ position: 'relative' },
  imgThumb:    { width: 72, height: 72, borderRadius: 8 },
  imgRemove:   { position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  imgAdd:      { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  switchRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#eee' },
  switchLabel: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  saveBtn:     { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.secondary },
})
