# SafeFlix: AI-Powered Parental Control for Streaming

What if your phone could tell you're too young to watch something — just by looking at your face?

That's the question I set out to answer for my university final project. The result was **SafeFlix**: an iOS app that uses on-device machine learning to predict a user's age via facial recognition and automatically filter out age-inappropriate streaming content.

No internet required. No data sent to servers. Everything runs locally on your iPhone.

---

## The Problem

Every day, children access content they shouldn't — not because parents don't care, but because supervision at scale is impossible. Parental controls exist, but they're clunky, easy to bypass, and depend on manual configuration.

I wanted to build something that just *works*. Seamlessly. Invisibly.

## The Architecture

SafeFlix is built on three layers:

### 1. The ML Model — Age Prediction via Facial Recognition

I trained a **MobileNetV2** model using TensorFlow on a labeled dataset of faces across age groups. MobileNetV2 was chosen specifically because it's designed for mobile — lightweight enough to run on-device without a GPU, while still accurate.

```python
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, Model

# Base model — pre-trained on ImageNet
base = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base.trainable = False

# Custom classification head
x = layers.GlobalAveragePooling2D()(base.output)
x = layers.Dense(128, activation='relu')(x)
x = layers.Dropout(0.3)(x)
output = layers.Dense(7, activation='softmax')(x)  # 7 age buckets

model = Model(base.input, output)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
```

After training, I exported the model to **Core ML format** using `coremltools`. This means the model lives entirely inside the app — no API calls, no latency, no privacy concerns.

### 2. The iOS App — SwiftUI + Vision Framework

The iOS layer uses Apple's `Vision` framework to detect faces in real time, then feeds the detected face region into the Core ML model.

```swift
import Vision
import CoreML

class AgeClassifier {
    private let model: VNCoreMLModel
    
    init() throws {
        let config = MLModelConfiguration()
        let coreMLModel = try AgePredictor(configuration: config)
        self.model = try VNCoreMLModel(for: coreMLModel.model)
    }
    
    func classify(pixelBuffer: CVPixelBuffer) async -> AgeBucket? {
        return await withCheckedContinuation { continuation in
            let request = VNCoreMLRequest(model: model) { request, _ in
                let result = request.results?
                    .compactMap { $0 as? VNClassificationObservation }
                    .max(by: { $0.confidence < $1.confidence })
                
                continuation.resume(returning: AgeBucket(rawValue: result?.identifier ?? ""))
            }
            let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer)
            try? handler.perform([request])
        }
    }
}
```

### 3. Content Filtering

Once the age is determined, SafeFlix maps it to a content rating tier (G, PG, PG-13, R) and filters the streaming library accordingly. Under-age users simply never see age-restricted content in their feed.

---

## The Results

| Age Group       | Model Accuracy |
|-----------------|---------------|
| Under 13        | 89.2%         |
| 13–17           | 84.7%         |
| 18–25           | 91.3%         |
| 26–40           | 88.9%         |
| 40+             | 86.1%         |

The model performs best at the extremes — young children and older adults — which is exactly where it matters most for content filtering.

## What I'd Do Differently

**More diverse training data.** The model has blind spots for certain ethnicities and lighting conditions. Real-world deployment would require a much more representative dataset.

**Fallback mechanisms.** What happens when the camera is covered? Or in low light? I'd build more graceful degradation.

**User transparency.** Users deserve to know *why* they're being shown certain content. I'd add an explanation layer — "SafeFlix estimated your age as 14–16 based on your appearance."

---

## Lessons Learned

Building SafeFlix taught me something important: **technology doesn't solve problems — design does.**

The ML model was the easy part. The hard part was asking: *Who is this for? When does it run? What happens when it's wrong? Who has control?*

These aren't engineering questions. They're human questions. And the best software engineers are the ones who never stop asking them.

---

*SafeFlix was my final project at Telkom University, May 2024. Built with TensorFlow, Core ML, and SwiftUI.*
