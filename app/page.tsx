import MainLayout from "@/components/layout/MainLayout";
import AddTransaction from "@/components/dashboard/AddTransaction";
import TransactionList from "@/components/dashboard/TransactionList";

export default function Home() {
  return (
    <MainLayout>
      <AddTransaction />
      <TransactionList />
    </MainLayout>
  );
}