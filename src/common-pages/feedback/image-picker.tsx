/**
 * Index
 * @file 选择图像
 * @module
 * @author
 */
import LazyImage from '@/components/basic/image/lazy-image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import React, {useMemo} from 'react';
import {View, ScrollView} from 'react-native';
import Upload from './upload';
import globalStore from '@/services/global.state';
import {useCallback} from 'react';
import {uploadOSSFile} from '@/app.service';

interface ImagePickerViewProps {
  max?: number;
  callback?: (source: string[]) => void;
}

const ImagePickerView = (props: ImagePickerViewProps): React.ReactElement => {
  const {max = 5, callback} = props;
  const [response, setResponse] = React.useState<string[]>([]);

  const imagePicker: any =
    globalStore.isAndroid && require('react-native-image-picker');

  const onPressCheckImage = () => {
    imagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1000, // 设置选择照片的大小，设置小的话会相应的进行压缩
        maxHeight: 1000,
        quality: 0.8,
        includeBase64: true,
      },
      async (res: any) => {
        if (res.didCancel) {
          return false;
        }
        if (globalStore.isAndroid) {
          // 对获取的图片进行处理
          const formData = new FormData();
          formData.append('file', {
            uri: [...res?.assets].shift()?.uri,
            type: 'multipart/form-data',
            name: 'pickerImage.jpg',
          } as any);
          const ret: any = await uploadOSSFile(formData);
          setResponse([...response, ret]);
        }
      },
    );
  };

  const pickerBtn = () => {
    if (response.length >= max) {
      return null;
    }
    return globalStore.isAndroid ? (
      <NativeTouchableOpacity
        style={[
          theme.flex.center,
          theme.border.primary50,
          theme.borderRadius.s,
          {height: 80, width: 80},
        ]}
        onPress={onPressCheckImage}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={require('@assets/icons/common/photo.webp')}
          width={32}
          height={32}
        />
      </NativeTouchableOpacity>
    ) : (
      <Upload
        pic={
          <LazyImage
            occupancy={'transparent'}
            imageUrl={require('@assets/icons/common/photo.webp')}
            width={32}
            height={32}
          />
        }
        callback={url => {
          const newList = [...response, url];
          setResponse(newList);
          if (callback) {
            callback(newList);
          }
        }}
        startUpload={() => {}}
        endUpload={() => {}}
      />
    );
  };

  const onClickDeleteItem = useCallback(
    (item: string) => {
      const filterList = response.filter(values => {
        return item !== values;
      });
      setResponse(filterList);
      if (callback) {
        callback(filterList);
      }
    },
    [callback, response],
  );

  const imageList = useMemo(() => {
    return response
      ?.map((item, index) => {
        if (!item) {
          return undefined;
        }
        return (
          // eslint-disable-next-line react-native/no-inline-styles
          <View key={index} style={{height: 80, width: 80}}>
            <LazyImage imageUrl={item} height={80} width={80} />
            <NativeTouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: 20,
                width: 20,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                onClickDeleteItem(item);
              }}>
              <LazyImage
                height={20}
                width={20}
                imageUrl={require('@assets/icons/close-white.webp')}
              />
            </NativeTouchableOpacity>
          </View>
        );
      })
      .filter(item => item !== undefined);
  }, [onClickDeleteItem, response]);

  return (
    <View style={[{height: 82, width: '100%'}]}>
      <ScrollView
        horizontal={true}
        style={[{height: 82, width: '100%'}]}
        contentContainerStyle={[theme.gap.m]}>
        {imageList}
        {pickerBtn()}
      </ScrollView>
    </View>
  );
};

export default ImagePickerView;
