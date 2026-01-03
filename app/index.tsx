/// <reference types="nativewind/types" />
import { FlatList, Image, Text, View, Pressable } from "react-native";
import { data } from "../Test/data";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-start pt-20 bg-['#0D0C1D']">
        <Text className="text-3xl my-20 font-bold text-center text-['#F1DAC4']">
          Welcome to Rent-Calculator!
        </Text>

        <FlatList 
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Link href={{
              pathname: `./forms/${item.id}`,
              params: {
                name: item.name,
                rent: item.Rent,
                dateOfCommencement: item.dateOfCommencement,
                advance: item.AdvancePaid,
                security: item.Security,
                avatarUrl: item.AvatarUrl
              }
            }} asChild>
              <Pressable className="flex items-center justify-center">
                <Image
                  source={item.AvatarUrl}
                  className="h-40 w-40  rounded-full mt-10"
                />
                <Text className="text-center text-lg font-bold text-['#A69CAC'] mt-2">
                  {item.name}
                </Text>
              </Pressable>
            </Link>
          )}
        />

    </View>
  );
}
