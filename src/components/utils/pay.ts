import {NativeModules} from 'react-native';

interface config {
  payeeVpa: string;
  payeeName: string;
  merchantCode: string;
  transactionId: string;
  transactionRefId: string;
  description: string;
  amount: string;
  targetPackage?: string;
  chooserText?: string;
}

export interface Success {
  status: 'SUCCESS';
  txnId: string;
  code: string;
  approvalRefNo: string;
}
export interface Error {
  status: 'FAILED';
  message: string;
}

const LINKING_ERROR = 'Ensure that the android build succeeds';

const EasyUpiPayment = NativeModules.EasyUpiPayment
  ? NativeModules.EasyUpiPayment
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export const upiPayment = {
  initiate(
    targetPackage: String,
    chooserText: String,
    config: config,
    onSuccess: Function,
    onFailure: Function,
  ) {
    EasyUpiPayment.intialPayment(
      {targetPackage, chooserText, ...config},
      onSuccess,
      onFailure,
    );
  },
  getInstalledApps(): () => String[] {
    return EasyUpiPayment.getInstalledUPIApps();
  },
};
