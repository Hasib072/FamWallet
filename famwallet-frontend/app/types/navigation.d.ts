// app/types/navigation.d.ts

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for your navigation stack
export type RootStackParamList = {
  FamilySection: undefined;
  AddTransaction: { familyId: string };
  // Add other routes and their parameters here
};

// Define types for useNavigation and useRoute hooks
export type AddTransactionNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddTransaction'
>;

export type AddTransactionRouteProp = RouteProp<
  RootStackParamList,
  'AddTransaction'
>;
