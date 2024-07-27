'use client'
import { convertFileToUrl } from '@/lib/utils'
import exp from 'constants'
import Image from 'next/image'
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

interface FileUploaderProps {
    files: File[] | undefined
    onChange: (files: File[]) => void
}

const FileUploader = ({files, onChange}: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles : File[]) => {
    onChange(acceptedFiles)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div 
        {...getRootProps()} 
        className='file-upload'
    >
      <input {...getInputProps()} />
      {files && files.length > 0 ? (
        <Image
            src={convertFileToUrl(files[0])}
            height={1000}
            width={1000}
            alt='Uploaded Image'
            className='max-h-[400px] overflow-hidden object-cover'
        />
      ) : (
        <>
            <Image
                src='/assets/icons/upload.svg'
                height={40}
                width={40}
                alt='Upload'
                className='mb-4'
            />
            <div className='file-upload_label'>
                <p className='text-14-regular'>
                    <span className='text-green-500'> Click to upload</span> or Drag and Drop
                </p>
                <p>
                    SVG, PNG, JPG, JPEG or GIF (max 800x400)
                </p>
            </div>
        </>
      )}
    </div>
  )
}

export default FileUploader