import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListQuery } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";
import dayjs from "dayjs";
import { Autocomplete, Grid, MenuItem } from "@mui/material";
import MDInput from "components/MDInput";

function TodayScreen() {
  const reorderType = 'dayOrder';
  const today = dayjs().format('YYYY-MM-DD');
  const priority = {low: "primary", medium: "warning", high: "error"}

  const [filters, setFilters] = useState({type: 'today', due_date: today});
  const [additionalFilters, setAdditionalFilters] = useState({});

  const {data, isLoading, isError, error, refetch} = useGetTaskListQuery(filters);
  const taskList = data ? data.data : null; 


  useEffect(() => {
    const fetchTasks = async () => {
      try {
          await refetch();
      } catch (error) {
          toast.error(CustomToast(error?.data?.message || error?.error));
      }
    };

    fetchTasks();
  }, [refetch]);


  const handleSearchFilters = (event, search = true) => {
    const { name, value } = event.target;
    setAdditionalFilters({...additionalFilters, [name]: value?.trim() ? value : undefined});
    if(search || !value){
      setFilters({...filters, [name]: value?.trim() ? value : undefined});   // changing default filter value auto calls the api...
    }
  } 


  // get categories from slice
  const categories = [
      // { title: 'The Shawshank Redemption', shared_with: ['user1', 'user2'] },
      // { title: 'The Godfather', shared_with: [] },
      // { title: 'The Godfather: Part II', shared_with: ['user1', 'user2'] },
      // { title: 'The Dark Knight', shared_with: [] },
      // { title: '12 Angry Men', shared_with: ['user1', 'user2'] },
      // { title: "Schindler's List", shared_with: null },
      // { title: 'Pulp Fiction', shared_with: ['user1', 'user2'] },
  ];
  const options = categories.map((option) => {
      return {
          projectType: option.shared_with && option.shared_with.length ? 'Shared Projects' : 'My Projects',
          ...option,
      };
  });


  return (
    <MDBox py={3}>
      {/* create addition filters here...  */}
      <MDBox mb={2}>
        <Grid container spacing={2} height="100%">
          <Grid item md={4} lg={3}>
              <MDInput
                  id="title"
                  name="title"
                  label="Search Task Name"
                  type="search"
                  variant="outlined"
                  value={additionalFilters.title || undefined}
                  onChange={(e) => handleSearchFilters(e, false) }
                  onKeyDown={(e) => { if (e.key === "Enter") setFilters({...filters, ...additionalFilters}) }}
                  fullWidth
              />
          </Grid>
          <Grid item md={4} lg={3}>
              <MDInput
                  size="large"
                  select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  label="Search by Priority"
                  InputProps={{
                      classes: { root: "select-input-styles" },
                  }}
                  value={additionalFilters.priority || undefined}
                  onChange={(e) => handleSearchFilters(e)}
                  sx={{textTransform: 'capitalize'}}
                  fullWidth
              >
                  <MenuItem value={undefined}><em>Select Task Priority</em></MenuItem>
                  {Object.entries(priority).map(([key, value], idx) => (
                      <MenuItem value={key} sx={{textTransform: 'capitalize'}}>{key}</MenuItem>
                  ))}
              </MDInput>
          </Grid>
          <Grid item md={4} lg={3}>
            <Autocomplete
                id="categories"
                name="categoryId"
                value={additionalFilters.categoryId || undefined}
                onChange={(e) => handleSearchFilters(e)}
                options={options.sort((a, b) => (a.projectType === 'My Projects' ? -1 : 1) - (b.projectType === 'My Projects' ? -1 : 1))}
                groupBy={(option) => option.projectType}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => <MDInput {...params} variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { padding: "5px" } }} label="Search by Project"
                />}
                noOptionsText="No Projects"
            />
          </Grid>
        </Grid>
      </MDBox>
      <TaskListComponent
        currentDate={dayjs().format('YYYY-MM-DD')}
        isLoading={isLoading} 
        taskList={taskList} 
        onAdd={true}
        onEdit={true} 
        onDelete={true}
        onComplete={true}
        onReorder={true}
        reorderType={reorderType}
        filters={filters}
        additionalFilters={filters.title || filters.priority || filters.categoryId ? true : false}
        // onPagination={true}
        // onPaginationHandle={() => handlePagination()}
      />
    </MDBox>
  );
}

export default TodayScreen;
