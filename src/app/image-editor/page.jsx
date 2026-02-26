"use client"
import ImageEditor from '@/components/Image-Editor/ImageEditor'
import React from 'react'

const page = () => {
    return (
        <div>
            <ImageEditor open={true} onClose={() => {}} initialImage={null} />
        </div>
    )
}

export default page 