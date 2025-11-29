import json
import sys

import numpy as np
from PIL import Image


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python run_inference.py <model_path> <image_path>"}))
        sys.exit(1)

    model_path = sys.argv[1]
    image_path = sys.argv[2]

    try:
        import tensorflow as tf
        import tensorflow_hub as hub

        # Register KerasLayer for TF Hub models
        model = tf.keras.models.load_model(
            model_path,
            custom_objects={'KerasLayer': hub.KerasLayer}
        )

        input_shape = model.input_shape[1:3]
        img = Image.open(image_path).convert("RGB")
        img = img.resize(input_shape)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array, verbose=0)

        result = {
            "success": True,
            "predictions": predictions.tolist(),
            "predicted_class": int(np.argmax(predictions)),
            "confidence": float(np.max(predictions))
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
