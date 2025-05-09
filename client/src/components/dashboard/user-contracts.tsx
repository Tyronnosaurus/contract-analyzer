import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../ui/table";
import { UploadModal } from "../modals/upload-modal";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";


export default function UserContracts() {
  // Fetch user contracts
  const { data: contracts } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: () => fetchUserContracts(),
  });

  const [sorting, setSorting] = useState<SortingState>([]); // Table sorting state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);  // Controls visibility of the UploadModal

  // Define colors for different contract types labels
  const contractTypeColors: { [key: string]: string } = {
    Employment: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Non-Disclosure Agreement":
      "bg-green-100 text-green-800 hover:bg-green-200",
    Sales: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Lease: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    Services: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  // Define columns for the table (contract ID, score, type, and actions).
  // Defines how each column behaves and displays. Renders badges with different colors depending on contract type or score.
  const contractsColumns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return <Button variant={"ghost"}>Contract ID</Button>;
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue<string>("_id")}</div>
      ),
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => {
        return <Button variant={"ghost"}>Overall Score</Button>;
      },
      cell: ({ row }) => {
        const score = parseFloat(row.getValue("overallScore"));
        return (
          <Badge
            className="rounded-md"
            variant={
              score > 75 ? "success" : score < 50 ? "destructive" : "secondary"
            }
          >
            {score.toFixed(2)} Overall Score
          </Badge>
        );
      },
    },
    {
      accessorKey: "contractType",
      header: "Contract Type",
      cell: ({ row }) => {
        const contractType = row.getValue("contractType") as string;
        const colorClass =
          contractTypeColors[contractType] || contractTypeColors["Other"];
        return (
          <Badge className={cn("rounded-md", colorClass)}>{contractType}</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contract = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} className="size-8 p-0">
                <span className="sr-only">
                  Open menu
                </span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/dashboard/contract/${contract._id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="text-destructive">
                      Delete Contract
                    </span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your contract and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];


  const auxFilesColumns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return <Button variant={"ghost"}>File ID</Button>;
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue<string>("_id")}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contract = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} className="size-8 p-0">
                <span className="sr-only">
                  Open menu
                </span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="text-destructive">
                      Delete File
                    </span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your file and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];




  // Create table with useReactTable, which handles table logic (sorting, pagination, rendering).
  // Manage headers, rows, cells with flexRender.
  const contractsTable = useReactTable({
    data: contracts ?? [],
    columns: contractsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Create table with useReactTable, which handles table logic (sorting, pagination, rendering).
  // Manage headers, rows, cells with flexRender.
  const auxFilesTable = useReactTable({
    data: contracts ?? [],
    columns: auxFilesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Calculate data for the 3 cards at the top
  const totalContracts = contracts?.length || 0;
  
  const averageScore =
    totalContracts > 0
      ? (contracts?.reduce(
          (sum, contract) => sum + (contract.overallScore ?? 0),
          0
        ) ?? 0) / totalContracts
      : 0;

  const highRiskContracts =
    contracts?.filter((contract) =>
      contract.risks.some((risk) => risk.severity === "high")
    ).length ?? 0;


  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Contracts</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>New Contract</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* General cards (Total Contracts, Average Score, High Risk Contracts)  */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskContracts}</div>
          </CardContent>
        </Card>
      </div>

      {/* List of contracts */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {contractsTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {contractsTable.getRowModel().rows?.length ? (
              contractsTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={contractsColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => contractsTable.setPageIndex(0)}
          disabled={!contractsTable.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => contractsTable.nextPage()}
          disabled={!contractsTable.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Modal for uploading new contracts. On completion, it refreshes the table */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => contractsTable.reset()}
      />

      {/* ////////////////////////////////////////////////////////////////////////////////////// */}
      {/* Table for auxiliar files. TODO: Add functionality to upload auxiliar files, create or modify the upload modal to handle this. */}
      
      {/* <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Auxiliar files</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>New auxiliar file</Button>
      </div> */}

      {/* List of auxiliar files */}
      {/* <div className="rounded-md border">
        <Table>
          <TableHeader>
            {auxFilesTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {auxFilesTable.getRowModel().rows?.length ? (
              auxFilesTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={auxFilesColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> */}

      {/* Table pagination */}
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => auxFilesTable.setPageIndex(0)}
          disabled={!auxFilesTable.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => auxFilesTable.nextPage()}
          disabled={!auxFilesTable.getCanNextPage()}
        >
          Next
        </Button>
      </div> */}


    </div>
  );
}

// Helper to fetch contract data using an api in the backend 
async function fetchUserContracts(): Promise<ContractAnalysis[]> {
  const response = await api.get("/contracts/user-contracts");
  return response.data;
}
