import React, {useCallback} from 'react';

import {useDropzone} from 'react-dropzone';
import theme from '@/style';
import {uploadOSSFile} from '@/app.service';
const Upload = ({
  pic,
  startUpload,
  endUpload,
  callback,
}: {
  pic?: React.ReactNode;
  startUpload?: () => void;
  endUpload?: () => void;
  callback: (url: string) => void;
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: any) => {
      startUpload?.();
      const ret: any = await uploadOSSFile({file: acceptedFiles[0]});
      callback(ret);
      endUpload?.();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: {'image/*': []},
  });

  return (
    <div
      {...getRootProps()}
      style={{
        display: 'flex',
        height: 80,
        width: 80,
        border: '1px solid #7230FF80',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <input {...getInputProps()} accept="image/*" />
      <div style={theme.margin.topxxs}>{pic}</div>
    </div>
  );
};

export default Upload;
