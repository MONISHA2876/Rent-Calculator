import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Invoice, Tenant } from '../types/types';
import { InvoiceCard } from './InvoiceCard';
import { Feather } from '@expo/vector-icons';

type StoredInvoices = Record<string, string>;

export default function PreviousInvoices({ tenantName }: { tenantName?: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receivedAmount, setReceivedAmount] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('invoices');
        if (!raw) {
          if (mounted) setInvoices([]);
          return;
        }

        const parsed: StoredInvoices = JSON.parse(raw) as StoredInvoices;

        const list = Object.entries(parsed).map(([key, rawVal]) => {
          try {
            const val = JSON.parse(rawVal);
            return {
              id: key,
              tenantId: val.tenantId || '',
              // keep original date string if present
              date: val.date || val.dateString || '',
              rent: val.rent || 0,
              electricityReading: val.electricityReading,
              electricityPerUnit: val.electricityPerUnit,
              electricityBill: val.electricityBill,
              gasReading: val.gasReading,
              gasPerUnit: val.gasPerUnit,
              gasBill: val.gasBill,
              addOns: val.addOns || [],
              discount: val.discount,
              discountDescription: val.discountDescription,
              pending: val.pending,
              pendingDescription: val.pendingDescription,
              total: val.total || 0,
              receivedAmount: val.receivedAmount,
              createdAt: val.createdAt || new Date().toISOString(),
              tenantName: val.tenantName || val.tenant || '',
            } as unknown as Invoice & { tenantName?: string };
          } catch (e) {
            console.error('Error parsing invoice', e);
            return null;
          }
        }).filter(Boolean) as (Invoice & { tenantName?: string })[];

        const filtered = tenantName
          ? list.filter((inv) => (inv.tenantName || '').toString() === tenantName)
          : list;

        if (mounted) setInvoices(filtered as Invoice[]);
      } catch (err) {
        console.error('Error loading invoices', err);
        if (mounted) setInvoices([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tenantName]);

  const saveInvoice = async (invoiceId: string) => {
    if (!receivedAmount) {
      Alert.alert('Error', 'Please enter the received amount before saving the invoice.');
      return;
    }else{
        try {
            const raw = await SecureStore.getItemAsync('invoices');
            if (!raw) {
                Alert.alert('Error', 'No invoices found to update.');
                return;
            }else{
                const parsed: StoredInvoices = JSON.parse(raw) as StoredInvoices;
                const invoiceRaw = parsed[invoiceId];
                if (!invoiceRaw) {
                    Alert.alert('Error', 'Invoice not found.');
                    return;
                }else{
                    const invoice: Invoice = JSON.parse(invoiceRaw);
                    invoice.receivedAmount = parseFloat(receivedAmount);
                    parsed[invoiceId] = JSON.stringify(invoice);
                    await SecureStore.setItemAsync('invoices', JSON.stringify(parsed));
                    setInvoices((cur) => cur.map((inv) => inv.id === invoiceId ? invoice : inv));
                    setReceivedAmount('');
                    Alert.alert('Success', 'Received amount saved successfully.');
                }
            }
        }catch(err){
            console.error('Failed to save received amount', err);
        }
  }
};

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const raw = await SecureStore.getItemAsync('invoices');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (!parsed[invoiceId]) return;
      delete parsed[invoiceId];
      await SecureStore.setItemAsync('invoices', JSON.stringify(parsed));
      setInvoices((cur) => cur.filter((inv) => inv.id !== invoiceId));
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  };

  const confirmDelete = (invoiceId: string) => {
    Alert.alert('Delete invoice', 'Are you sure you want to delete this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteInvoice(invoiceId) },
    ]);
  };

  const renderItem = ({ item }: { item: Invoice }) => {
    const tenant: Tenant = {
      id: (item as any).tenantId || 'unknown',
      name: (item as any).tenantName || 'Unknown',
      monthlyRent: item.rent || 0,
      createdAt: item.createdAt || new Date().toISOString(),
    };

    return (
      <View className="mb-4">
        <View className="flex-row justify-end mb-2">
          <TouchableOpacity onPress={() => confirmDelete(item.id)} className="px-2 py-1">
            <Feather name="trash-2" size={20} color="#b91c1c" />
          </TouchableOpacity>
        </View>
        <InvoiceCard invoice={item} tenant={tenant} receivedAmount={item.receivedAmount} />
        {item.receivedAmount === undefined ? (
          <View>
            <View className="mb-3">
                <Text className="text-sm font-medium text-['#A69CAC'] my-2">
                    Received Amount
                </Text>
                <TextInput
                    value={receivedAmount}
                    onChangeText={(text) => {setReceivedAmount(text);}}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#A69CAC"
                    className="rounded-lg px-4 py-3 text-base bg-['#161B33'] text-['#F1DAC4']"
                />
                </View>
                <TouchableOpacity
                    onPress={() => saveInvoice(item.id)}
                    className="bg-green-600 rounded-lg py-4 items-center"
                >
                    <Text className="text-white text-base font-semibold">Save Invoice</Text>
                </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  if (!invoices.length) {
    return (
      <View className="p-4">
        <Text className="text-['#A69CAC']">No previous invoices found.</Text>
      </View>
    );
  }

  return (
    <View className="p-4">
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}