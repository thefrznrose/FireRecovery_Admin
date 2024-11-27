declare namespace google.picker {
    interface PickerBuilder {
      addView(view: DocsView): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(callback: (response: PickerResponse) => void): PickerBuilder;
      enableFeature(feature: Feature): PickerBuilder;
      build(): Picker;
    }
  
    interface DocsView {
      setIncludeFolders(include: boolean): DocsView;
      setSelectFolderEnabled(select: boolean): DocsView;
      setMimeTypes(mimeTypes: string): DocsView;
    }
  
    interface Picker {
      setVisible(visible: boolean): void;
    }
  
    interface PickerResponse {
      action: string;
      docs: Array<{
        id: string;
        name: string;
        mimeType: string;
      }>;
    }
  
    enum Feature {
      MULTISELECT_ENABLED = "MULTISELECT_ENABLED",
    }
  
    const PickerBuilder: {
      new (): PickerBuilder;
    };
  
    const DocsView: {
      new (): DocsView;
    };
  
    const Action: {
      PICKED: "picked";
      CANCEL: "cancel";
    };
  }
  