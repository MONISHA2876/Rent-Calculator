import { View, Text } from 'react-native';
import { Invoice, Tenant } from '../types/types';

interface InvoiceCardProps {
  invoice: Invoice;
  tenant: Tenant;
  receivedAmount?: number;
}

export function InvoiceCard({ invoice, tenant, receivedAmount }: InvoiceCardProps) {
  const displayReceivedAmount = receivedAmount !== undefined ? receivedAmount : invoice.receivedAmount;
  return (
    <View className="bg-['#161B33'] p-4 rounded-lg">
      <Text className="text-xl font-bold text-['#F1DAC4'] mb-1">INVOICE</Text>
      <Text className="text-sm text-['#F1DAC4'] mb-4">
        {invoice.date} • {tenant.name}
      </Text>

      <View className="border-t border-gray-200 pt-3 mt-2">
        <View className="flex-row justify-between mb-2">
          <Text className="text-['#F1DAC4']">Rent</Text>
          <Text className="text-['#F1DAC4'] font-medium">₹{invoice.rent.toFixed(2)}</Text>
        </View>

        {invoice.electricityBill && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-['#F1DAC4']">Electricity</Text>
            <Text className="text-['#F1DAC4'] font-medium">
              ₹{invoice.electricityBill.toFixed(2)}
            </Text>
          </View>
        )}

        {invoice.gasBill && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-['#F1DAC4']">Gas</Text>
            <Text className="text-['#F1DAC4'] font-medium">₹{invoice.gasBill.toFixed(2)}</Text>
          </View>
        )}

        {invoice.addOns.map((addOn, index) => (
          <View key={index} className="flex-row justify-between mb-2">
            <Text className="text-['#F1DAC4']">{addOn.label}</Text>
            <Text className="text-['#F1DAC4'] font-medium">₹{addOn.amount.toFixed(2)}</Text>
          </View>
        ))}

        {invoice.discount && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-['#F1DAC4']">
              Discount{invoice.discountDescription ? ` (${invoice.discountDescription})` : ''}
            </Text>
            <Text className="text-['#F1DAC4'] font-medium">-₹{invoice.discount.toFixed(2)}</Text>
          </View>
        )}

        {invoice.pending && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-['#F1DAC4']">
              Pending{invoice.pendingDescription ? ` (${invoice.pendingDescription})` : ''}
            </Text>
            <Text className="text-['#F1DAC4'] font-medium">+₹{invoice.pending.toFixed(2)}</Text>
          </View>
        )}

        <View className="border-t border-gray-300 mt-3 pt-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg font-semibold text-['#F1DAC4']">Total</Text>
            <Text className="text-lg font-bold text-['#F1DAC4']">₹{invoice.total.toFixed(2)}</Text>
          </View>

          {displayReceivedAmount !== undefined && (
            <View className="flex-row justify-between mt-2">
              <Text className="text-['#F1DAC4']">Received</Text>
              <Text className="text-['#F1DAC4'] font-medium">
                ₹{displayReceivedAmount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

