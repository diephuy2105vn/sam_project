import {
  ActionIcon,
  AppShell,
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Menu,
  Modal,
  MultiSelect,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconFolder,
  IconLayoutGrid,
  IconLayoutList,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";

import { useEffect, useState } from "react";
import projectApi from "../services/projectApi";
import { Link } from "react-router-dom";

type ProjectType = {
  id?: string;
  name: string;
  description: string;
  labels: string[];
  createdAt?: string;
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isOpenModal, setIsOpen] = useState(false);

  // Form state
  const [creatingProject, setCreatingProject] = useState<ProjectType>({
    name: "",
    description: "",
    labels: [],
  });

  const [updatingProject, setUpdatingProject] = useState<ProjectType | null>(
    null
  );

  const [modalMode, setModalMode] = useState<"create" | "update">("create");

  const [projects, setProjects] = useState<ProjectType[]>([]);

  const fetchProject = async () => {
    try {
      const res = await projectApi.getProject();
      setProjects(res.data as ProjectType[]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const toggleModal = (mode?: "update" | "create") => {
    setIsOpen(!isOpenModal);
    if (mode) setModalMode(mode);
  };

  const handleCreateProject = async () => {
    if (!creatingProject.name.trim()) {
      alert("Vui lòng nhập tên dự án");
      return;
    }
    const res = await projectApi.createProject(creatingProject);

    const createdProject = res.data as ProjectType;

    setProjects([createdProject, ...projects]);
    setCreatingProject({ name: "", description: "", labels: [] });
    toggleModal();
  };

  const handleUpdateProject = async () => {
    if (!updatingProject?.id) return;

    const res = await projectApi.updateProject(
      updatingProject?.id,
      updatingProject
    );

    const updatedProject = res.data as ProjectType;

    setProjects((pre) =>
      pre.map((proj) => (proj.id === updatedProject.id ? updatedProject : proj))
    );

    setUpdatingProject(null);
    toggleModal();
  };

  const handleDeleteProject = (id: string | undefined) => {
    setProjects(projects.filter((p) => p?.id !== id));
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      padding="md"
      styles={{
        main: {
          minHeight: "100vh",
        },
      }}
    >
      <AppShell.Main>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="center">
              <div>
                <Text size="32px" fw={700}>
                  Dự Án Của Tôi
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Quản lý và tổ chức các dự án annotation của bạn
                </Text>
              </div>
              <Button
                leftSection={<IconPlus size={20} />}
                variant="gradient"
                gradient={{ from: "brand", to: "blue", deg: 90 }}
                onClick={() => toggleModal("create")}
              >
                Tạo Dự Án Mới
              </Button>
            </Group>

            {/* Search Bar */}
            <Flex justify="space-between" align="center" gap="md">
              <TextInput
                placeholder="Tìm kiếm dự án..."
                leftSection={<IconSearch size={20} />}
                size="md"
                radius="xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, maxWidth: 560 }}
              />
              <SegmentedControl
                value={viewMode}
                size="md"
                onChange={(value) => setViewMode(value as "grid" | "table")}
                data={[
                  {
                    value: "grid",
                    label: (
                      <Flex align="center" gap={8}>
                        <IconLayoutGrid size={18} />
                        <span>Lưới</span>
                      </Flex>
                    ),
                  },
                  {
                    value: "table",
                    label: (
                      <Flex align="center" gap={8}>
                        <IconLayoutList size={18} />
                        <span>Bảng</span>
                      </Flex>
                    ),
                  },
                ]}
              />
            </Flex>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              viewMode === "grid" ? (
                <Grid gutter="lg">
                  {filteredProjects.map((project) => (
                    <Grid.Col
                      key={project.id}
                      span={{ base: 12, sm: 6, md: 4 }}
                    >
                      <Card shadow="md" padding="lg" radius="md">
                        {/* Content */}
                        <Stack gap="xs">
                          <Group justify="space-between" align="flex-start">
                            <Text fw={600} size="lg" lineClamp={1}>
                              {project.name}
                            </Text>
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDots size={20} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={16} />}
                                  style={{}}
                                  onClick={() => {
                                    toggleModal("update");
                                    setUpdatingProject(project);
                                  }}
                                >
                                  Chỉnh sửa
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconTrash size={16} />}
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
                                  }}
                                >
                                  Xóa
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>

                          {project.description && (
                            <Text size="sm" c="dimmed" lineClamp={3}>
                              {project.description}
                            </Text>
                          )}

                          {project.labels.length > 0 && (
                            <Flex gap={4} wrap="wrap" mt="xs">
                              {project.labels.map((label, idx) => (
                                <Badge
                                  key={idx}
                                  size="sm"
                                  variant="dot"
                                  color="blue"
                                >
                                  {label}
                                </Badge>
                              ))}
                            </Flex>
                          )}

                          {project?.createdAt && (
                            <Text size="xs" c="dimmed" mt="xs">
                              Tạo ngày:{" "}
                              {new Date(project?.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Table
                  highlightOnHover
                  verticalSpacing="md"
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th
                        style={{
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Tên dự án
                      </Table.Th>
                      <Table.Th
                        style={{
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Mô tả
                      </Table.Th>
                      <Table.Th
                        style={{
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Nhãn
                      </Table.Th>
                      <Table.Th
                        style={{
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Ngày tạo
                      </Table.Th>
                      <Table.Th
                        style={{
                          fontWeight: 600,
                          padding: "16px",
                          width: 100,
                          textAlign: "center",
                        }}
                      >
                        Thao tác
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredProjects.map((project) => (
                      <Table.Tr
                        key={project.id}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <Table.Td
                          style={{
                            padding: "16px",
                          }}
                        >
                          <Link
                            to={`/project/${project.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Text size="sm" c="brand" fw="500">
                              {project.name}
                            </Text>
                          </Link>
                        </Table.Td>
                        <Table.Td
                          style={{
                            padding: "16px",
                            maxWidth: 300,
                          }}
                        >
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {project.description || "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td
                          style={{
                            padding: "16px",
                          }}
                        >
                          <Flex gap={4} wrap="wrap">
                            {project.labels.length > 0 ? (
                              project.labels.map((label, idx) => (
                                <Badge
                                  key={idx}
                                  size="sm"
                                  variant="dot"
                                  color="gray"
                                >
                                  {label}
                                </Badge>
                              ))
                            ) : (
                              <Text size="sm" c="dimmed">
                                —
                              </Text>
                            )}
                          </Flex>
                        </Table.Td>
                        <Table.Td
                          style={{
                            padding: "16px",
                          }}
                        >
                          {project.createdAt && (
                            <Text size="sm" c="dimmed">
                              {new Date(project.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td
                          style={{
                            padding: "16px",
                          }}
                        >
                          <Flex justify="center">
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDots size={20} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={16} />}
                                  style={{}}
                                >
                                  Chỉnh sửa
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconTrash size={16} />}
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
                                  }}
                                >
                                  Xóa
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )
            ) : (
              <Stack align="center" gap="md" py={60}>
                <IconFolder size={80} color="#5C5F66" />
                <Text size="xl" c="dimmed">
                  {searchQuery
                    ? "Không tìm thấy dự án nào"
                    : "Chưa có dự án nào"}
                </Text>
                {!searchQuery && (
                  <Button
                    leftSection={<IconPlus size={20} />}
                    variant="light"
                    size="lg"
                    onClick={() => toggleModal("create")}
                  >
                    Tạo Dự Án Đầu Tiên
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Create Project Modal */}
      <Modal
        opened={isOpenModal}
        onClose={() => toggleModal()}
        title={
          <Text size="xl" fw={700}>
            {modalMode == "create" ? "Tạo Dự Án Mới" : "Cập Nhật Dự Án"}
          </Text>
        }
        size="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Tên dự án"
            placeholder="Nhập tên dự án..."
            size="sm"
            styles={{
              label: {
                marginBottom: "8px",
              },
            }}
            required
            value={
              modalMode === "update"
                ? updatingProject?.name
                : creatingProject.name
            }
            onChange={(e) =>
              modalMode === "update"
                ? setUpdatingProject((pre) =>
                    pre
                      ? {
                          ...pre,
                          name: e.target.value,
                        }
                      : null
                  )
                : setCreatingProject((pre) => ({
                    ...pre,
                    name: e.target.value,
                  }))
            }
          />

          <Textarea
            label="Mô tả"
            size="sm"
            styles={{
              label: {
                marginBottom: "8px",
              },
            }}
            placeholder="Nhập mô tả dự án..."
            minRows={3}
            value={
              modalMode === "update"
                ? updatingProject?.description
                : creatingProject.description
            }
            onChange={(e) =>
              modalMode === "update"
                ? setUpdatingProject((pre) =>
                    pre
                      ? {
                          ...pre,
                          description: e.target.value,
                        }
                      : null
                  )
                : setCreatingProject((pre) => ({
                    ...pre,
                    description: e.target.value,
                  }))
            }
          />

          <MultiSelect
            label="Nhãn"
            size="sm"
            styles={{
              label: {
                marginBottom: "8px",
              },
            }}
            placeholder="Chọn hoặc thêm nhãn..."
            value={
              modalMode === "update"
                ? updatingProject?.labels
                : creatingProject.labels
            }
            onChange={(value) =>
              modalMode === "update"
                ? setUpdatingProject((pre) =>
                    pre
                      ? {
                          ...pre,
                          labels: value,
                        }
                      : null
                  )
                : setCreatingProject((pre) => ({
                    ...pre,
                    labels: value,
                  }))
            }
            searchable
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setIsOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: "brand", to: "blue", deg: 90 }}
              onClick={
                modalMode === "update"
                  ? handleUpdateProject
                  : handleCreateProject
              }
            >
              {modalMode === "update" ? "Cập nhật" : "Tạo dự án"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
};

export default HomePage;
