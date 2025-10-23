"""
Test script to verify all dependencies are properly installed and compatible
"""
import sys
import importlib

def test_imports():
    """Test that all required packages can be imported"""
    required_packages = [
        ('numpy', 'NumPy'),
        ('cv2', 'OpenCV'),
        ('pandas', 'Pandas'),
        ('sklearn', 'Scikit-learn'),
        ('ultralytics', 'Ultralytics YOLOv8'),
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('websockets', 'WebSockets'),
    ]
    
    print("Testing Python dependencies...")
    print("-" * 60)
    
    all_ok = True
    for package_name, display_name in required_packages:
        try:
            module = importlib.import_module(package_name)
            version = getattr(module, '__version__', 'unknown')
            print(f"✓ {display_name:25} version {version}")
        except ImportError as e:
            print(f"✗ {display_name:25} FAILED - {str(e)}")
            all_ok = False
    
    print("-" * 60)
    return all_ok

def test_pose_app():
    """Test that pose_app modules can be imported"""
    print("\nTesting pose_app modules...")
    print("-" * 60)
    
    modules = [
        'pose_app.pose_tracker',
        'pose_app.detectors',
        'pose_app.geometry',
        'pose_app.dataset',
    ]
    
    all_ok = True
    for module_name in modules:
        try:
            importlib.import_module(module_name)
            print(f"✓ {module_name}")
        except ImportError as e:
            print(f"✗ {module_name} FAILED - {str(e)}")
            all_ok = False
    
    print("-" * 60)
    return all_ok

def test_backend():
    """Test that backend can be imported"""
    print("\nTesting backend...")
    print("-" * 60)
    
    try:
        sys.path.insert(0, '.')
        from backend import main
        print("✓ Backend module loaded successfully")
        
        # Check if FastAPI app exists
        if hasattr(main, 'app'):
            print("✓ FastAPI app instance found")
        else:
            print("✗ FastAPI app instance not found")
            return False
            
        # Check exercise map
        if hasattr(main, 'EXERCISE_MAP') and len(main.EXERCISE_MAP) > 0:
            print(f"✓ Exercise map loaded with {len(main.EXERCISE_MAP)} exercises")
            for exercise in main.EXERCISE_MAP.keys():
                print(f"  - {exercise}")
        else:
            print("✗ Exercise map not found or empty")
            return False
            
        print("-" * 60)
        return True
    except Exception as e:
        print(f"✗ Backend test FAILED - {str(e)}")
        print("-" * 60)
        return False

def test_model_file():
    """Test that YOLO model file exists"""
    import os
    print("\nTesting model file...")
    print("-" * 60)
    
    model_path = "pose_app/yolov8n-pose.pt"
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"✓ Model file found: {model_path} ({size_mb:.2f} MB)")
        print("-" * 60)
        return True
    else:
        print(f"⚠ Model file not found: {model_path}")
        print("  It will be downloaded automatically on first run")
        print("-" * 60)
        return True  # Not critical, will download

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("Pose Coach - Setup Verification")
    print("=" * 60 + "\n")
    
    results = {
        'Python Dependencies': test_imports(),
        'Pose App Modules': test_pose_app(),
        'Backend Module': test_backend(),
        'Model File': test_model_file(),
    }
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name:25} {status}")
    
    print("=" * 60 + "\n")
    
    if all(results.values()):
        print("✓ All tests passed! Your setup is ready.")
        print("\nNext steps:")
        print("1. Start the backend: python backend/main.py")
        print("2. In a new terminal, start the frontend:")
        print("   cd frontend && npm install && npm run dev")
        print("3. Open http://localhost:3000 in your browser")
        return 0
    else:
        print("✗ Some tests failed. Please install missing dependencies:")
        print("   pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())

