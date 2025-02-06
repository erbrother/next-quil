import BillingForm from "@/components/BillingForm"
import { getUserSubscriptionPlan } from "@/lib/stripe"
const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    if (subscriptionPlan) {
        return <div>Loading...</div>
    }

    return <BillingForm subscriptionPlan={subscriptionPlan} />
}

export default Page