import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Text,
  Chip,
  Button,
  Portal,
  Modal,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProjectsStore } from '@/lib/store';
import { Project } from '@/types';
import Toast from 'react-native-toast-message';

export default function ProjectsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  const { 
    projects, 
    isLoading, 
    error,
    fetchProjects, 
    createProject,
    setCurrentProject,
    clearError 
  } = useProjectsStore();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      clearError();
    }
  }, [error]);

  const loadProjects = async () => {
    try {
      await fetchProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription || undefined,
      });
      
      setModalVisible(false);
      setNewProjectName('');
      setNewProjectDescription('');
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Project created successfully',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleProjectPress = (project: Project) => {
    setCurrentProject(project);
    router.push({
      pathname: '/project-detail',
      params: { projectId: project.id },
    });
  };

  const renderProject = ({ item: project }: { item: Project }) => (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleProjectPress(project)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Title numberOfLines={1}>{project.name}</Title>
            {project.description && (
              <Paragraph numberOfLines={2}>{project.description}</Paragraph>
            )}
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
        
        {project.counts && (
          <View style={styles.statsContainer}>
            <Chip
              icon="task"
              mode="outlined"
              compact
              style={styles.statChip}
            >
              {project.counts.tasks.active} active tasks
            </Chip>
            <Chip
              icon="image"
              mode="outlined"
              compact
              style={styles.statChip}
            >
              {project.counts.media} media
            </Chip>
            {project.counts.references.total > 0 && (
              <Chip
                icon="bookmark"
                mode="outlined"
                compact
                style={styles.statChip}
              >
                {project.counts.references.total} refs
              </Chip>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="folder-open"
        size={64}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.emptyTitle}>No Projects Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first project to get started with CosmicBoard
      </Text>
      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={styles.emptyButton}
      >
        Create Project
      </Button>
    </View>
  );

  if (isLoading && projects.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={projects.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
        label="New Project"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Title>Create New Project</Title>
          
          <TextInput
            label="Project Name"
            value={newProjectName}
            onChangeText={setNewProjectName}
            style={styles.input}
            mode="outlined"
            autoFocus
          />
          
          <TextInput
            label="Description (Optional)"
            value={newProjectDescription}
            onChangeText={setNewProjectDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateProject}
              style={styles.modalButton}
            >
              Create
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  input: {
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
  },
});