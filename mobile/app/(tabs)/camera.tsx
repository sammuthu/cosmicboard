import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  FAB,
  Card,
  Chip,
  Portal,
  Modal,
  TextInput,
  useTheme,
  ActivityIndicator,
  ProgressBar,
} from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { useProjectsStore, useMediaStore } from '@/lib/store';
import { Project, UploadProgress } from '@/types';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [customName, setCustomName] = useState('');
  const [capturedImage, setCapturedImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  
  const { projects, fetchProjects } = useProjectsStore();
  const { uploadMedia, uploadProgress } = useMediaStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      await fetchProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await requestCameraPermission();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is required to take photos.');
      return false;
    }

    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Media library access is required to save photos.');
      return false;
    }

    return true;
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedImage({
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage({
          uri: asset.uri,
          type: 'application/pdf',
          name: asset.name || `document_${Date.now()}.pdf`,
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setUploadModalVisible(true);
  };

  const handleUpload = async () => {
    if (!capturedImage || !selectedProject) return;

    try {
      const mediaType = capturedImage.type.startsWith('image/') 
        ? 'photo' 
        : capturedImage.type === 'application/pdf' 
        ? 'pdf' 
        : 'screenshot';

      await uploadMedia(
        capturedImage,
        selectedProject.id,
        mediaType,
        customName || undefined,
        (progress: UploadProgress) => {
          console.log('Upload progress:', progress);
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Upload Complete',
        text2: 'Media uploaded successfully',
      });

      // Reset state
      setCapturedImage(null);
      setSelectedProject(null);
      setCustomName('');
      setModalVisible(false);
      setUploadModalVisible(false);
    } catch (error) {
      console.error('Upload failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!cameraPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="camera-alt" size={64} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to take photos for your projects.
        </Text>
        <Button mode="contained" onPress={requestCameraPermission} style={styles.permissionButton}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
      >
        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}
          >
            <MaterialIcons name="flip-camera-ios" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Capture Controls */}
        <View style={styles.captureControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.capturing]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size={30} color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.documentButton} onPress={pickDocument}>
            <MaterialIcons name="description" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Project Selection Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text style={styles.modalTitle}>Select Project</Text>
          <Text style={styles.modalSubtitle}>Choose a project to upload your media</Text>
          
          <View style={styles.projectList}>
            {projects.map((project) => (
              <Card
                key={project.id}
                style={styles.projectCard}
                onPress={() => handleProjectSelect(project)}
              >
                <Card.Content>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.description && (
                      <Text style={styles.projectDescription} numberOfLines={1}>
                        {project.description}
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </Card.Content>
              </Card>
            ))}
          </View>
        </Modal>
      </Portal>

      {/* Upload Configuration Modal */}
      <Portal>
        <Modal
          visible={uploadModalVisible}
          onDismiss={() => setUploadModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text style={styles.modalTitle}>Upload Media</Text>
          {selectedProject && (
            <Chip icon="folder" style={styles.selectedProject}>
              {selectedProject.name}
            </Chip>
          )}
          
          <TextInput
            label="Custom Name (Optional)"
            value={customName}
            onChangeText={setCustomName}
            style={styles.input}
            mode="outlined"
            placeholder={capturedImage?.name}
          />
          
          {/* Show upload progress if uploading */}
          {Object.keys(uploadProgress).length > 0 && (
            <View style={styles.progressContainer}>
              <Text>Uploading...</Text>
              <ProgressBar
                progress={Object.values(uploadProgress)[0]?.loaded / Object.values(uploadProgress)[0]?.total || 0}
                style={styles.progressBar}
                color={theme.colors.primary}
              />
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setUploadModalVisible(false)}
              disabled={Object.keys(uploadProgress).length > 0}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpload}
              disabled={Object.keys(uploadProgress).length > 0}
            >
              Upload
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 10,
    marginVertical: 5,
  },
  captureControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 15,
  },
  documentButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturing: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  permissionButton: {
    marginTop: 20,
  },
  modal: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  projectList: {
    maxHeight: 400,
  },
  projectCard: {
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  selectedProject: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});