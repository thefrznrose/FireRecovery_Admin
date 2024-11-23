export {};

declare global {
  interface Window {
    gapi: any;
    google: {
    accounts: {
        id: {
            initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            }) => void;
            renderButton: (element: HTMLElement | null, options: any) => void;
        };
    };
      picker: {
        PickerBuilder: new () => {
          addView: (view: any) => any;
          setOAuthToken: (token: string) => any;
          setDeveloperKey: (key: string) => any;
          setCallback: (callback: (data: any) => void) => any;
          build: () => { setVisible: (visible: boolean) => void };
        };
        DocsView: new () => {
          setIncludeFolders: (include: boolean) => any;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
  }
}
