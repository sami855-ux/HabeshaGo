import React from "react"
import { StatusBar, Text, View } from "react-native"

const PaymentPage = () => {
  return (
    <>
      <StatusBar translucent={true} barStyle={"dark-content"} />

      <View className="pt-8">
        <Text>PaymentPage</Text>
      </View>
    </>
  )
}

export default PaymentPage
