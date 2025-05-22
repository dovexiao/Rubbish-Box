import React, {useCallback} from 'react';

import {useDropzone} from 'react-dropzone';
import {uploadProfilePhoto, updateProfile} from './pofile.service';
import {flex} from '@/components/style';
import theme from '@/style';
const Upload = ({
  info,
  getUserInfo,
  pic,
  startUpload,
  endUpload,
}: {
  info?: {userName: string};
  getUserInfo: () => void;
  pic?: React.ReactNode;
  startUpload?: () => void;
  endUpload?: () => void;
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: any) => {
      startUpload?.();
      const ret: any = await uploadProfilePhoto({file: acceptedFiles[0]});
      await updateProfile(info?.userName!, ret);
      getUserInfo();
      endUpload?.();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [info],
  );
  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: {'image/*': []},
  });
  return (
    <div {...getRootProps()} style={flex.center}>
      <input {...getInputProps()} accept="image/*" />
      <div style={theme.margin.topxxs}>{pic}</div>
    </div>
  );
};

export default Upload;
