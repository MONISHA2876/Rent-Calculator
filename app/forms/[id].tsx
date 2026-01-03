import { View, Text, Image, TextInput, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AddOn } from "@/types/types";
import { InvoiceCard } from "@/components/InvoiceCard";

export default function RentCalculator() {
  const { name, rent, dateOfCommencement, advance, security, avatarUrl }= useLocalSearchParams();
  const [pending, setpending] = useState<number>(0);
  const [rentAmt, setRentAmt] = useState(Number(rent));
  const tenant = {
    id: 'tenant1',
    name: name as string,
    monthlyRent: Number(rent),
    createdAt: new Date().toISOString(),
  };

  const setPending = (text: string) => {
    const amount = parseFloat(text);
    if (!isNaN(amount)) {
      setpending(amount);
    }
  };

  //Electricity Bill Calculator States
  const [perUnit, setPerUnit] = useState<string>('8');
  const [unitsConsumed, setUnitsConsumed] = useState<string>('');
  const [electricityBill, setElectricityBill] = useState<number>(0);

  //Gas Bill Calculator States
  const [gasPerUnit, setGasPerUnit] = useState<string>('10');
  const [gasUnitsConsumed, setGasUnitsConsumed] = useState<string>('');
  const [gasBill, setGasBill] = useState<number>(0);

  //Add-ons States
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [discount, setDiscount] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [pendingDescription, setPendingDescription] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [calculatedInvoice, setCalculatedInvoice] = useState<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const addAddOn = () => {
    const newAddOn: AddOn = {
      id: Date.now().toString(),
      label: '',
      amount: 0,
    };
    setAddOns([...addOns, newAddOn]);
  };

  const updateAddOn = (addOnId: string, updates: Partial<AddOn>) => {
    setAddOns(
      addOns.map((item) => (item.id === addOnId ? { ...item, ...updates } : item))
    );
  };

  const removeAddOn = (addOnId: string) => {
    setAddOns(addOns.filter((item) => item.id !== addOnId));
  };

  const calculateTotal = () => {
    const discountAmount = parseFloat(discount) || 0;
    const addOnsTotal = addOns.reduce((sum, item) => sum + (item.amount || 0), 0);

    const total =
      rentAmt +
      electricityBill +
      gasBill +
      addOnsTotal -
      discountAmount +
      pending;

    const invoice = {
      tenantId: 'tenant1',
      date: `${date}/${month}/${year}`,
      rent: rentAmt,
      electricityReading: unitsConsumed ? parseFloat(unitsConsumed) : undefined,
      electricityPerUnit: perUnit ? parseFloat(perUnit) : undefined,
      electricityBill: electricityBill || undefined,
      gasReading: gasUnitsConsumed ? parseFloat(gasUnitsConsumed) : undefined,
      gasPerUnit: gasPerUnit ? parseFloat(gasPerUnit) : undefined,
      gasBill: gasBill || undefined,
      addOns: addOns.filter((item) => item.label && item.amount > 0),
      discount: discountAmount || undefined,
      discountDescription: discountDescription || undefined,
      pending: pending || undefined,
      pendingDescription: pendingDescription || undefined,
      total,
      receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
    };

    setCalculatedInvoice(invoice);
  }; 

  const calculateElectricityBill = (units: string, rate: string) => {
    const unitsNum = parseFloat(units) || 0;
    const rateNum = parseFloat(rate) || 0;
    setElectricityBill(unitsNum * rateNum);
  };

  const calculateGasBill = (units: string, rate: string) => {
    const unitsNum = parseFloat(units) || 0;
    const rateNum = parseFloat(rate) || 0;
    setGasBill(unitsNum * rateNum);
  };

  //Date Object
  const dateObj = new Date();
  const date = dateObj.getDate();
  const month = dateObj.getMonth() + 1; 
  const year = dateObj.getFullYear();

  const saveInvoice = () => {
    if (calculatedInvoice) {
      setCalculatedInvoice(null);
      // Reset form
      setRentAmt(tenant.monthlyRent);
      setUnitsConsumed('');
      setPerUnit('8');
      setGasUnitsConsumed('');
      setGasPerUnit('10');
      setAddOns([]);
      setDiscount('');
      setDiscountDescription('');
      setpending(0);
      setPendingDescription('');
      setReceivedAmount('');
    }
  };

  const copyInvoiceText = async () => {
    if (!calculatedInvoice) return;

    const currentReceivedAmount = receivedAmount ? parseFloat(receivedAmount) : calculatedInvoice.receivedAmount;

    const invoiceText = `
INVOICE
Date: ${calculatedInvoice.date}
Tenant: ${tenant.name}

Rent: ₹${calculatedInvoice.rent.toFixed(2)}
${calculatedInvoice.electricityBill ? `Electricity: ₹${calculatedInvoice.electricityBill.toFixed(2)}` : ''}
${calculatedInvoice.gasBill ? `Gas: ₹${calculatedInvoice.gasBill.toFixed(2)}` : ''}
${calculatedInvoice.addOns.length > 0 ? calculatedInvoice.addOns.map((addOn: AddOn) => `${addOn.label}: ₹${addOn.amount.toFixed(2)}`).join('\n') : ''}
${calculatedInvoice.discount ? `Discount (${calculatedInvoice.discountDescription || 'N/A'}): -₹${calculatedInvoice.discount.toFixed(2)}` : ''}
${calculatedInvoice.pending ? `Pending (${calculatedInvoice.pendingDescription || 'N/A'}): +₹${calculatedInvoice.pending.toFixed(2)}` : ''}

Total: ₹${calculatedInvoice.total.toFixed(2)}
${currentReceivedAmount ? `Received: ₹${currentReceivedAmount.toFixed(2)}` : ''}
    `.trim();

    try {
      await Share.share({
        message: invoiceText,
        title: `Invoice for ${tenant.name}`,
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };



  return (
    <SafeAreaProvider>
      <View style={{width: '100%', height: '100%', backgroundColor: '#0D0C1D'}}>
       <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
      <View className=" min-h-screen justify-around flex-1">

        <View className="flex flex-row justify-between items-start p-4 mt-10 mx-1">

          {/* User Profile */}

          <View className="bg-['#161B33'] flex flex-row p-3 items-center justify-center rounded-lg" style={{maxWidth: '40%'}}>
            <Image
              source={avatarUrl as any}
              className="h-6 w-6 rounded-full"
              style={{marginRight: 8}}
            />
            <Text className="text-lg font-bold text-['#F1DAC4'] mt-1">
              {name}
            </Text>
          </View>

          {/* Details Overview */}

          <View className="bg-['#161B33'] flex-1 p-3 rounded-lg" style={{maxWidth: '55%'}}>
            <Text className="text-lg font-bold text-['#A69CAC']">
              Advance Paid: {advance}{"\n"}
              Security Deposit: {security}{"\n"}
              Pending: {pending}
            </Text>
          </View>
        </View>

        <View style={{height: "0.2%", width: "100%", backgroundColor: "#A69CAC", marginTop: 30, marginBottom: 20}}></View>

          {/* Calculator form */}

        <View className="p-4 flex flex-col gap-8 justify-start">

          <View className="flex flex-row gap-2 justify-between align-center w-full">

            <View className="flex flex-row items-center justify-start gap-4">
              <Text className="text-lg font-bold text-['#A69CAC']">Rent: ₹</Text>
              <TextInput
                value={rentAmt.toString()}
                onChangeText={(text) => setRentAmt(Number(text))}
                keyboardType="numeric"
                className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-4 py-2 text-right"
                style={{width: "40%"}}
              />
            </View>

            <View className="flex flex-row items-center justify-end mr-2">
              <Text className="text-lg font-bold text-['#A69CAC'] pr-4">Date</Text>
              <TextInput
                value={date.toString()}
                onChangeText={() => {}}
                keyboardType="numeric"
                className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-2 py-2 text-right"
                style={{width: 30}}
              />
              <Text className="text-['#F1DAC4'] py-2">/</Text>
              <TextInput
                value={month.toString()}
                onChangeText={() => {}}
                keyboardType="numeric"
                className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-2 py-2 text-right"
                style={{width: 30}}
              />
              <Text className="text-['#F1DAC4'] py-2">/</Text>
              <TextInput
                value={year.toString()}
                onChangeText={() => {}}
                keyboardType="numeric"
                className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-2 py-2 text-right"
                style={{width: 60}}
              />  
            </View>
          </View>

          {/* Electricity bill calculator */}
          <View>
            <Text className="text-['#A69CAC'] text-bold text-md">Electricity</Text>
            <View className="flex flex-row gap-2 justify-between align-center w-full">
              <View className="flex flex-row items-center justify-start gap-4">
                <Text className="text-lg font-bold text-['#A69CAC']">Reading:</Text>
                <TextInput
                  value={unitsConsumed}
                  onChangeText={(text) => {
                    setUnitsConsumed(text);
                    calculateElectricityBill(text, perUnit);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#A69CAC"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-4 py-2 text-right"
                  style={{width: 150}}
                />
              </View>
              <View className="flex flex-row items-center justify-end mr-2">
                <Text className="text-lg font-bold text-['#A69CAC'] pr-4">Per Unit:  ₹</Text>
                <TextInput
                  value={perUnit}
                  onChangeText={(text) => {
                    setPerUnit(text);
                    calculateElectricityBill(unitsConsumed, text);
                  }}
                  keyboardType="decimal-pad"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-2 py-2 text-right"
                  style={{width: 50}}
                />
              </View>
            </View>
            <View className="flex flex-row items-center mt-2 justify-start gap-4">
                <Text className="text-lg font-bold text-['#A69CAC']">Bill:       ₹</Text>
                <TextInput
                  value={electricityBill.toFixed(2)}
                  onChangeText={(text) => {
                    const bill = parseFloat(text);
                    if (!isNaN(bill)) {
                      setElectricityBill(bill);
                    }
                  }}
                  keyboardType="decimal-pad"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-4 py-2 text-right"
                  style={{width: 150}}
                />
              </View>
          </View>


        {/* Gas bill calculator */}
          <View>
            <Text className="text-['#A69CAC'] text-bold text-md">Gas</Text>
            <View className="flex flex-row gap-2 justify-between align-center w-full">
              <View className="flex flex-row items-center justify-start gap-4">
                <Text className="text-lg font-bold text-['#A69CAC']">Reading:</Text>
                <TextInput
                  value={gasUnitsConsumed}
                  onChangeText={(text) => {
                    setGasUnitsConsumed(text);
                    calculateGasBill(text, gasPerUnit);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#A69CAC"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-4 py-2 text-right"
                  style={{width: 150}}
                />
              </View>
              <View className="flex flex-row items-center justify-end mr-2">
                <Text className="text-lg font-bold text-['#A69CAC'] pr-4">Per Unit:  ₹</Text>
                <TextInput
                  value={gasPerUnit}
                  onChangeText={(text) => {
                    setGasPerUnit(text);
                    calculateGasBill(gasUnitsConsumed, text);
                  }}
                  keyboardType="decimal-pad"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-2 py-2 text-right"
                  style={{width: 50}}
                />
              </View>
            </View>
            <View className="flex flex-row items-center mt-2 justify-start gap-4">
                <Text className="text-lg font-bold text-['#A69CAC']">Bill:       ₹</Text>
                <TextInput
                  value={gasBill.toFixed(2)}
                  onChangeText={(text) => {
                    const bill = parseFloat(text);
                    if (!isNaN(bill)) {
                      setGasBill(bill);
                    }
                  }}
                  keyboardType="decimal-pad"
                  className="bg-['#161B33'] text-['#F1DAC4'] rounded-lg px-4 py-2 text-right"
                  style={{width: 150}}
                />
              </View>
          </View>

          {/* Additional bill calculators  */}

            {/* Add-ons */}
            <View className="mb-4 rounded-lg">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-['#A69CAC']">Add-ons</Text>
                <TouchableOpacity
                  onPress={addAddOn}
                  className="bg-['#474973'] px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-sm font-medium">+ Add</Text>
                </TouchableOpacity>
              </View>
              {addOns.map((addOn) => (
                <View key={addOn.id} className="flex-row items-center mb-1">
                  <TextInput
                    value={addOn.label}
                    onChangeText={(label) => updateAddOn(addOn.id, { label })}
                    placeholder="Add a label"
                    placeholderTextColor="#A69CAC"
                    className="rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4'] flex-1 mr-2"
                  />
                  <TextInput
                    value={addOn.amount.toString()}
                    onChangeText={(amount) =>
                      updateAddOn(addOn.id, { amount: parseFloat(amount) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="Amount"
                    className="rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4'] w-24"
                  />
                  <TouchableOpacity
                    onPress={() => removeAddOn(addOn.id)}
                    className="ml-2 bg-red-700 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-sm">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Discount & Pending */}
            <View className="mb-4  rounded-lg">
              <View className="mb-3">
                <Text className="text-base font-semibold text-['#A69CAC'] mb-2">Discount</Text>
                <TextInput
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  placeholder="Amount"
                  placeholderTextColor="#A69CAC"
                  className="rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4'] mb-2"
                />
                <TextInput
                  value={discountDescription}
                  onChangeText={setDiscountDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor="#A69CAC"
                  className=" rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4']"
                />
              </View>
              <View>
                <Text className="text-base font-semibold text-['#A69CAC'] mb-2">Pending</Text>
                <TextInput
                  value={pending.toString()}
                  onChangeText={setPending}
                  keyboardType="numeric"
                  placeholder="Amount"
                  placeholderTextColor="#A69CAC"
                  className="rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4'] mb-2"
                />
                <TextInput
                  value={pendingDescription}
                  onChangeText={setPendingDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor="#A69CAC"
                  className="rounded-lg px-4 py-2 text-base bg-['#161B33'] text-['#F1DAC4']"
                />
              </View>
            </View>

            {/* Calculate Button */}
            <TouchableOpacity
              onPress={calculateTotal}
              className="bg-['#474973'] rounded-lg py-4 items-center mb-4"
            >
              <Text className="text-white text-base font-semibold">Calculate Total</Text>
            </TouchableOpacity>


        {/* Invoice */}
          {calculatedInvoice && (
            <View className="mb-4">
              <InvoiceCard
                invoice={calculatedInvoice}
                tenant={tenant}
                receivedAmount={receivedAmount ? parseFloat(receivedAmount) : undefined}
              />
              <TouchableOpacity
                onPress={copyInvoiceText}
                className="bg-gray-600 rounded-lg py-3 items-center my-3"
              >
                <Text className="text-white text-base font-medium">Copy Invoice</Text>
              </TouchableOpacity>
              <View className="mb-3">
                <Text className="text-sm font-medium text-['#A69CAC'] my-2">
                  Received Amount
                </Text>
                <TextInput
                  value={receivedAmount}
                  onChangeText={setReceivedAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A69CAC"
                  className="rounded-lg px-4 py-3 text-base bg-['#161B33'] text-['#F1DAC4']"
                />
              </View>
              <TouchableOpacity
                onPress={saveInvoice}
                className="bg-green-600 rounded-lg py-4 items-center"
                >
                <Text className="text-white text-base font-semibold">Save Invoice</Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
      </View>
      </KeyboardAwareScrollView>
      </View>
    </SafeAreaProvider>
  );
}