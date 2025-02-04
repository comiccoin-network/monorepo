// app/(cointx)/transaction.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { CheckCircle, XCircle, ArrowLeft, Send, AlertCircle, RotateCw } from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useBlockTransaction } from "../../hooks/useBlockTransactionByNonce";

// Renamed to better reflect its purpose in the new structure
function TransactionStateScreen() {
    const params = useLocalSearchParams();
   const { nonce } = params;
   const [verificationAttempts, setVerificationAttempts] = useState(0);
   const [hasTimeout, setHasTimeout] = useState(false);
   const maxAttempts = 30;
   const INITIAL_DELAY = 3000;
   const VERIFICATION_INTERVAL = 2000;
   const ERROR_THRESHOLD = 3; // Number of consecutive errors before showing error state
   const [consecutiveErrors, setConsecutiveErrors] = useState(0);

   const { blockTxData, isBlockTxLoading, blockTxError, blockTxRefetch } =
     useBlockTransaction(nonce as string);

   // Add error tracking
   useEffect(() => {
     if (blockTxError) {
       setConsecutiveErrors((prev) => prev + 1);
     } else if (blockTxData) {
       setConsecutiveErrors(0);
     }
   }, [blockTxError, blockTxData]);

   // Add timeout tracking
   useEffect(() => {
     const timeoutId = setTimeout(() => {
       if (!blockTxData && !hasTimeout) {
         setHasTimeout(true);
       }
     }, 60000); // 1 minute timeout

     return () => clearTimeout(timeoutId);
   }, [blockTxData]);

   useEffect(() => {
     if (!nonce) {
       console.error("No transaction nonce provided");
       router.replace("/(user)/overview");
       return;
     }

     const initialTimeout = setTimeout(() => {
       if (!blockTxData && !blockTxError) {
         console.log("Starting verification after initial delay");
         blockTxRefetch();
         setVerificationAttempts(1);
       }
     }, INITIAL_DELAY);

     return () => clearTimeout(initialTimeout);
   }, [nonce]);

   useEffect(() => {
     if (
       !blockTxData &&
       !hasTimeout &&
       consecutiveErrors < ERROR_THRESHOLD &&
       verificationAttempts > 0 &&
       verificationAttempts < maxAttempts
     ) {
       console.log(
         `Starting verification interval, attempt ${verificationAttempts}/${maxAttempts}`,
       );

       const interval = setInterval(() => {
         console.log(
           `🔄 Verifying transaction attempt ${verificationAttempts + 1}/${maxAttempts}`,
         );
         blockTxRefetch();
         setVerificationAttempts((prev) => prev + 1);
       }, VERIFICATION_INTERVAL);

       return () => clearInterval(interval);
     }
   }, [blockTxData, consecutiveErrors, hasTimeout, verificationAttempts]);

   // Handle network errors or timeout
   if (consecutiveErrors >= ERROR_THRESHOLD || hasTimeout) {
     return (
       <SafeAreaProvider>
         <SafeAreaView style={styles.container}>
           <View style={styles.content}>
             <View style={[styles.icon, styles.cautionIcon]}>
               <AlertCircle size={48} color="#D97706" />
             </View>

             <Text style={[styles.title, styles.cautionTitle]}>
               {hasTimeout ? "Verification Taking Longer" : "Network Issue"}
             </Text>

             <Text style={styles.message}>
               {hasTimeout
                 ? "Your transaction has been submitted but is taking longer than usual to verify. Don't worry - your coins are safe."
                 : "We're having trouble connecting to our servers. Your transaction has been submitted and your coins are safe."}
             </Text>

             <View style={styles.infoCard}>
               <Text style={styles.infoTitle}>What's happening?</Text>
               <Text style={styles.infoText}>
                 Your transaction is being processed by the network. This can take longer
                 during busy periods or when network conditions aren't optimal.
               </Text>

               <Text style={styles.infoTitle}>What should you do?</Text>
               <Text style={styles.infoText}>
                 You can safely return to your overview, where you'll see your transaction
                 status update automatically. Your coins are secure regardless of the
                 verification status.
               </Text>
             </View>

             <View style={styles.buttonContainer}>
               <TouchableOpacity
                 style={[styles.button, styles.primaryButton]}
                 onPress={() => router.replace("/(user)/overview")}
               >
                 <ArrowLeft size={20} color="white" />
                 <Text style={styles.buttonText}>Return to Overview</Text>
               </TouchableOpacity>

               <TouchableOpacity
                 style={[styles.button, styles.secondaryButton]}
                 onPress={() => {
                   setConsecutiveErrors(0);
                   setHasTimeout(false);
                   blockTxRefetch();
                 }}
               >
                 <RotateCw size={20} color="#7C3AED" />
                 <Text style={styles.secondaryButtonText}>Try Again</Text>
               </TouchableOpacity>
             </View>
           </View>
         </SafeAreaView>
       </SafeAreaProvider>
     );
   }

  // Handler functions now use the new navigation structure
  const handleNavigateToOverview = () => {
    router.replace("/(user)/overview");
  };

  const handleSendMore = () => {
    router.replace("/(user)/send");
  };

  // Handle verification timeout - this is a failure state
  if (verificationAttempts >= maxAttempts && !blockTxData) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={[styles.icon, styles.warningIcon]}>
              <XCircle size={48} color="#DC2626" />
            </View>
            <Text style={styles.title}>Verification Timeout</Text>
            <Text style={styles.message}>
              The transaction has been submitted but we couldn't verify its
              status. Please check your transaction history for updates.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNavigateToOverview}
            >
              <ArrowLeft size={20} color="white" />
              <Text style={styles.buttonText}>Return to Overview</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show loading state - this is the pending state
  if (
    isBlockTxLoading ||
    (!blockTxData && verificationAttempts < maxAttempts)
  ) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Verifying your transaction...
            </Text>
            <Text style={styles.subText}>This may take a few moments</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show error state.
  if (blockTxError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={[styles.icon, styles.cautionIcon]}>
              <AlertCircle size={48} color="#D97706" />
            </View>

            <Text style={[styles.title, styles.cautionTitle]}>
              Transaction In Progress
            </Text>

            <Text style={styles.message}>
              We've encountered a temporary issue while checking your
              transaction status. Don't worry - your coins are safe and the
              transaction has been submitted to the network.
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What's happening?</Text>
              <Text style={styles.infoText}>
                Your transaction is being processed by the network, but we're
                having trouble getting its current status. This is usually
                temporary and resolves itself.
              </Text>

              <Text style={styles.infoTitle}>What should you do?</Text>
              <Text style={styles.infoText}>
                You can safely return to your overview, where you'll be able to
                see your transaction history. The status will update
                automatically once the network confirms it.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleNavigateToOverview}
              >
                <ArrowLeft size={20} color="white" />
                <Text style={styles.buttonText}>Return to Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => blockTxRefetch()}
              >
                <RotateCw size={20} color="#7C3AED" />
                <Text style={styles.secondaryButtonText}>Check Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show success state
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.icon, styles.successIcon]}>
            <CheckCircle size={48} color="#059669" />
          </View>

          <Text style={styles.title}>Transaction Complete!</Text>
          <Text style={styles.subtitle}>
            Your coins have been sent successfully
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Sent</Text>
              <Text style={styles.detailValue}>
                {blockTxData?.value || 0} CC
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network Fee</Text>
              <Text style={styles.detailValue}>{blockTxData?.fee || 1} CC</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {blockTxData?.to || ""}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleNavigateToOverview}
            >
              <ArrowLeft size={20} color="white" />
              <Text style={styles.buttonText}>Back to Overview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSendMore}
            >
              <Send size={20} color="#7C3AED" />
              <Text style={styles.secondaryButtonText}>Send More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIcon: {
    backgroundColor: "#DCFCE7",
  },
  warningIcon: {
    backgroundColor: "#FEE2E2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
  },
  cautionIcon: {
    backgroundColor: "#FEF3C7",
  },
  cautionTitle: {
    color: "#D97706",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});

export default TransactionStateScreen;
