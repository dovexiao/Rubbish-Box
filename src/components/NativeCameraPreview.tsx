import React, { useMemo, useRef } from "react"
import { Platform, UIManager, findNodeHandle, requireNativeComponent, ViewStyle } from "react-native"

type PhotoCapturedEvent = {
  nativeEvent: {
    path: string
    uri: string
  }
}

type Props = {
  style?: ViewStyle
  gestureEnabled?: boolean
  /** Android CameraCharacteristics.LENS_FACING_*: 0=front, 1=back */
  cameraFacing?: number
  photoCount: number
  maxPhotos: number
  onPhotoCaptured: (e: PhotoCapturedEvent) => void
}

type NativeCommands = {
  takePhoto: number | string
}

const NativeComponent = requireNativeComponent<Props>("NativeCameraPreview")

export const NativeCameraPreview = React.forwardRef<{ takePhoto: () => void }, Props>(
  ({ gestureEnabled = true, cameraFacing = 1, photoCount, maxPhotos, onPhotoCaptured, style }, ref) => {
    const nativeRef = useRef<any>(null)

    const command = useMemo(() => {
      const cfg = UIManager.getViewManagerConfig?.("NativeCameraPreview")
      console.log("📷 [NativeCameraPreview] UIManager config:", cfg)
      console.log("📷 [NativeCameraPreview] Commands:", cfg?.Commands)
      return (cfg?.Commands ?? {}) as NativeCommands
    }, [])

    React.useImperativeHandle(ref, () => ({
      takePhoto: () => {
        console.log("📷 [NativeCameraPreview] takePhoto called")
        if (Platform.OS !== "android") {
          console.log("📷 [NativeCameraPreview] Not Android, skipping")
          return
        }
        const tag = findNodeHandle(nativeRef.current)
        console.log("📷 [NativeCameraPreview] Native tag:", tag)
        if (!tag) {
          console.log("📷 [NativeCameraPreview] No tag found!")
          return
        }
        const takePhotoCmd = command.takePhoto
        console.log("📷 [NativeCameraPreview] takePhoto command:", takePhotoCmd)
        if (takePhotoCmd == null) {
          console.log("📷 [NativeCameraPreview] No takePhoto command!")
          return
        }
        console.log("📷 [NativeCameraPreview] Dispatching command...")
        UIManager.dispatchViewManagerCommand(tag, takePhotoCmd as any, [])
      },
    }))

    if (Platform.OS !== "android") return null

    console.log("📷 [NativeCameraPreview] Rendering native component, gestureEnabled:", gestureEnabled, "photoCount:", photoCount)

    return (
      <NativeComponent
        ref={nativeRef}
        style={style}
        gestureEnabled={gestureEnabled}
        cameraFacing={cameraFacing}
        photoCount={photoCount}
        maxPhotos={maxPhotos}
        onPhotoCaptured={(e) => {
          // Debug events from native
          if (e.nativeEvent.debug) {
            console.log("📷 [Native Debug]", e.nativeEvent.debug)
            return // Don't forward debug events
          }
          console.log("📷 [NativeCameraPreview] onPhotoCaptured event:", e.nativeEvent)
          onPhotoCaptured(e)
        }}
      />
    )
  },
)

NativeCameraPreview.displayName = "NativeCameraPreview"

