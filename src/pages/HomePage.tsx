import {
  AppShell,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Badge,
  Menu,
  Table,
  Flex,
  SegmentedControl,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconPhoto,
  IconDots,
  IconEdit,
  IconTrash,
  IconFolder,
  IconLayoutList,
  IconLayoutGrid,
} from "@tabler/icons-react";

import { useState } from "react";
import { Link } from "react-router-dom";

type ProjectType = {
  id: number;
  name: string;
  imageCount: number;
  createdAt: string;
  thumbnail?: string;
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [projects, setProjects] = useState<ProjectType[]>([
    {
      id: 1,
      name: "Dự án nhận diện sản phẩm",
      imageCount: 24,
      createdAt: "2024-12-20",
      thumbnail:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop",
    },
    {
      id: 2,
      name: "Phát hiện khuyết tật",
      imageCount: 156,
      createdAt: "2024-12-18",
      thumbnail:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    },
    {
      id: 3,
      name: "Kiểm tra chất lượng",
      imageCount: 89,
      createdAt: "2024-12-15",
    },
  ]);

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id));
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
                <Text size="32px" fw={700} c="white">
                  Dự Án Của Tôi
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Quản lý và tổ chức các dự án annotation của bạn
                </Text>
              </div>
              <Link to="/project/create">
                <Button
                  leftSection={<IconPlus size={20} />}
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 90 }}
                >
                  Tạo Dự Án Mới
                </Button>
              </Link>
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
                      <Card
                        shadow="md"
                        padding="lg"
                        radius="md"
                        style={{
                          backgroundColor: "#25262B",
                          borderColor: "#373A40",
                          border: "1px solid #373A40",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#4C6EF5";
                          e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#373A40";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* Thumbnail */}
                        <Card.Section>
                          <Flex
                            justify="center"
                            align="center"
                            style={{
                              height: 180,
                              backgroundColor: "#1A1B1E",
                              backgroundImage: project.thumbnail
                                ? `url(${project.thumbnail})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            {!project.thumbnail && (
                              <IconFolder size={60} color="#5C5F66" />
                            )}
                          </Flex>
                        </Card.Section>

                        {/* Content */}
                        <Stack gap="xs" mt="md">
                          <Group justify="space-between" align="flex-start">
                            <Text fw={600} size="lg" c="white" lineClamp={1}>
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
                              <Menu.Dropdown
                                style={{
                                  backgroundColor: "#25262B",
                                  borderColor: "#373A40",
                                }}
                              >
                                <Menu.Item
                                  leftSection={<IconEdit size={16} />}
                                  style={{ color: "white" }}
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

                          <Group gap="xs">
                            <Badge
                              variant="light"
                              color="blue"
                              leftSection={<IconPhoto size={14} />}
                            >
                              {project.imageCount} ảnh
                            </Badge>
                          </Group>

                          <Text size="xs" c="dimmed">
                            Tạo ngày:{" "}
                            {new Date(project.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
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
                    backgroundColor: "#25262B",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Table.Thead style={{ backgroundColor: "#1A1B1E" }}>
                    <Table.Tr>
                      <Table.Th
                        style={{
                          color: "white",
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Tên dự án
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: "white",
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Số lượng ảnh
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: "white",
                          fontWeight: 600,
                          padding: "16px",
                        }}
                      >
                        Ngày tạo
                      </Table.Th>
                      <Table.Th
                        style={{
                          color: "white",
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
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2C2E33";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Table.Td
                          style={{
                            color: "white",
                            borderColor: "#373A40",
                            padding: "16px",
                          }}
                        >
                          <Flex align="center" gap="md">
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: "#1A1B1E",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundImage: project.thumbnail
                                  ? `url(${project.thumbnail})`
                                  : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                flexShrink: 0,
                              }}
                            >
                              {!project.thumbnail && (
                                <IconFolder size={24} color="#5C5F66" />
                              )}
                            </div>
                            <Text fw={500}>{project.name}</Text>
                          </Flex>
                        </Table.Td>
                        <Table.Td
                          style={{
                            color: "white",
                            borderColor: "#373A40",
                            padding: "16px",
                          }}
                        >
                          <Badge
                            variant="light"
                            color="blue"
                            leftSection={<IconPhoto size={14} />}
                          >
                            {project.imageCount} ảnh
                          </Badge>
                        </Table.Td>
                        <Table.Td
                          style={{
                            borderColor: "#373A40",
                            padding: "16px",
                          }}
                        >
                          <Text size="sm" c="dimmed">
                            {new Date(project.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </Table.Td>
                        <Table.Td
                          style={{
                            borderColor: "#373A40",
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
                              <Menu.Dropdown
                                style={{
                                  backgroundColor: "#25262B",
                                  borderColor: "#373A40",
                                }}
                              >
                                <Menu.Item
                                  leftSection={<IconEdit size={16} />}
                                  style={{ color: "white" }}
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
                  <Link to="/project/create">
                    <Button
                      leftSection={<IconPlus size={20} />}
                      variant="light"
                      size="lg"
                    >
                      Tạo Dự Án Đầu Tiên
                    </Button>
                  </Link>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default HomePage;
